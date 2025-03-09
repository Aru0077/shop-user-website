<template>
    <div class="pageContent">
        <!-- 顶部标题 -->
        <div class="px-[5px]">
            <div class="text-[25px] font-bold leading-4 text-black">My Page</div>
        </div>

        <!-- 用户信息 -->
        <div class="flex items-center justify-start p-1 bg-white shadow-lg rounded-lg mt-2">
            <van-image :src="logoImg" fit="cover" radius="20%" width="60px" height="60px" />
            <div class="ml-2">
                <div class="text-[16px] font-bold">{{ userStore.userInfo?.username }}</div> 
            </div>

        </div>

        <!-- 统一菜单列表 -->
        <div class="menu-list bg-white rounded-lg shadow-xl px-1 py-2 mb-4 mt-2">
            <template v-for="(item, index) in menuItems" :key="item.id">
                <!-- 普通菜单项 -->
                <template v-if="item.type !== 'logout'">
                    <div class="menu-item flex items-center justify-between py-2 px-1"
                        @click="navigateTo(item.path || '')" :class="item.textColorClass || ''">
                        <div class="flex items-center">
                            <component :is="item.icon" :size="item.iconSize || 18"
                                :class="`${item.iconColorClass || 'text-gray-700'} mr-1`" />
                            <span class="text-[16px]">{{ item.title }}</span>
                        </div>
                        <div class="flex items-center">
                            <ChevronRight :size="16" class="text-gray-400" />
                        </div>
                    </div>

                    <!-- 分隔线 -->
                    <div class="border-b border-gray-100 mx-3" v-if="item.divider && index < menuItems.length - 1">
                    </div>
                </template>

                <!-- 退出登录按钮 -->
                <div v-else-if="item.type === 'logout' && isLoggedIn"
                    class="logout-btn bg-white rounded-2xl shadow-lg flex items-center justify-center py-1 px-1 mt-2"
                    @click="handleLogout">
                    <component :is="item.icon" :size="item.iconSize || 18" class="text-gray-700 mr-1" />
                    <span class="text-[14px]">{{ item.title }}</span>
                </div>
            </template>
        </div>

        <!-- Copyright -->
        <div class="copyright text-center text-[10px] text-gray-400 mt-6">
            <p>© 2025 Uni - Mall. All rights reserved.</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import logoImg from '@/assets/images/unimall.png';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showDialog, showSuccessToast } from 'vant';
import { useUserStore } from '@/store/user.store';
import { useFavoriteStore } from '@/store/favorite.store';
import {
    User, Settings, ChevronRight, CreditCard,
    PackageCheck, Truck, CheckCircle, MapPin,
    Heart, ShieldCheck, FileText, Trash, LogOut
} from 'lucide-vue-next';

// 菜单配置
const menuItems = ref([
    {
        id: 'orders',
        icon: PackageCheck,
        title: 'My Orders',
        path: '/order/list',
        iconSize: 18,
        divider: true
    },
    {
        id: 'addresses',
        icon: MapPin,
        title: 'My Addresses',
        path: '/address/list',
        iconSize: 18,
        divider: true
    },
    {
        id: 'privacy',
        icon: ShieldCheck,
        title: 'Privacy Policy',
        path: '/privacy',
        iconSize: 18,
        divider: true
    },
    {
        id: 'terms',
        icon: FileText,
        title: 'Terms of Service',
        path: '/terms',
        iconSize: 18,
        divider: true
    },
    {
        id: 'delete-account',
        icon: Trash,
        title: 'Delete Account',
        path: '/delete-account',
        iconSize: 18,
        iconColorClass: 'text-red-500',
        textColorClass: 'text-red-500',
        divider: false
    },
    {
        id: 'logout',
        type: 'logout',
        icon: LogOut,
        title: 'Log Out',
        iconSize: 18
    }
]);

// 初始化路由和状态管理
const router = useRouter();
const userStore = useUserStore();
const favoriteStore = useFavoriteStore();

// 获取用户信息
const userInfo = computed(() => userStore.getUserInfo);
const isLoggedIn = computed(() => userStore.getIsLoggedIn);

// 获取收藏数量
const favoriteCount = computed(() => favoriteStore.favoriteCount);



// Page navigation
const navigateTo = (path: string) => {
    router.push(path);
};

// Handle logout
const handleLogout = () => {
    showDialog({
        title: 'Log Out',
        message: 'Are you sure you want to log out?',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#000',
    }).then(async () => {
        try {
            await userStore.logout();
            showSuccessToast('Logged out successfully');
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }).catch(() => {
        // User canceled operation
    });
};
</script>

<style scoped>
.avatar-container {
    border: 1px solid #b6b6b6;
}

.menu-item {
    transition: background-color 0.2s;
}

.menu-item:active {
    background-color: #f5f5f5;
}

.icon-wrapper {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.order-status-item {
    cursor: pointer;
}

.order-status-item:active {
    opacity: 0.8;
}

.logout-btn {
    transition: all 0.2s;
    border: 1px solid #f5f5f5;
}

.logout-btn:active {
    background-color: #f5f5f5;
    transform: scale(0.98);
}
</style>