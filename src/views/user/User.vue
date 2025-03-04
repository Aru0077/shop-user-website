<template>
    <div class="pageContent">
        <!-- User information card -->
        <div class="user-card bg-gray-100 rounded-2xl shadow-xl mb-3 flex items-center mt-3">
            <!-- User avatar -->
            <div class="avatar-container relative">
                <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <User :size="20" v-if="!userInfo" />
                    <div v-else
                        class="text-[20px] font-bold text-white bg-black w-full h-full flex items-center justify-center">
                        {{ userInfo.username?.charAt(0)?.toUpperCase() }}
                    </div>
                </div>
            </div>

            <!-- User info -->
            <div class="ml-3 flex-1">
                <div class="text-[22px] font-bold" v-if="userInfo">{{ userInfo.username }}</div>
                <div class="text-[20px] font-bold" v-else>Guest</div>
                <div class="text-xs text-gray-500" v-else>
                    Sign in to experience more features
                </div>
            </div>
        </div>

        <!-- Orders summary -->
        <div class="order-summary bg-gray-100 rounded-lg shadow-xl mb-3 p-2">
            <div class="flex items-center justify-between mb-3">
                <div class="text-[18px] font-bold">My Orders</div>
                <div class="text-[14px] text-gray-500 flex items-center" @click="navigateTo('/order/list')">
                    View All
                    <ChevronRight :size="14" />
                </div>
            </div>

            <!-- Order status icons -->
            <div class="grid grid-cols-4 gap-2 text-center">
                <div class="order-status-item" @click="navigateTo('/order/list?status=unpaid')">
                    <div class="icon-wrapper mx-auto mb-1 relative">
                        <CreditCard :size="20" />
                        <div v-if="false"
                            class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            2
                        </div>
                    </div>
                    <div class="text-[10px]">Unpaid</div>
                </div>

                <div class="order-status-item" @click="navigateTo('/order/list?status=unshipped')">
                    <div class="icon-wrapper mx-auto mb-1 relative">
                        <PackageCheck :size="20" />
                    </div>
                    <div class="text-[10px]">Processing</div>
                </div>

                <div class="order-status-item" @click="navigateTo('/order/list?status=shipped')">
                    <div class="icon-wrapper mx-auto mb-1 relative">
                        <Truck :size="20" />
                    </div>
                    <div class="text-[10px]">Shipped</div>
                </div>

                <div class="order-status-item" @click="navigateTo('/order/list?status=completed')">
                    <div class="icon-wrapper mx-auto mb-1 relative">
                        <CheckCircle :size="20" />
                    </div>
                    <div class="text-[10px]">Completed</div>
                </div>
            </div>
        </div>

        <!-- 统一菜单列表 -->
        <div class="menu-list bg-gray-100 rounded-lg shadow-xl px-1 py-2 mb-4">
            <template v-for="(item, index) in menuItems" :key="item.id">
                <!-- 普通菜单项 -->
                <template v-if="item.type !== 'logout'">
                    <div class="menu-item flex items-center justify-between py-1 px-1" @click="navigateTo(item.path || '')"
                        :class="item.textColorClass || ''">
                        <div class="flex items-center">
                            <component :is="item.icon" :size="item.iconSize || 18"
                                :class="`${item.iconColorClass || 'text-gray-700'} mr-1`" />
                            <span class="text-[14px]">{{ item.title }}</span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-xs text-gray-400 mr-1" v-if="item.showCount && favoriteCount > 0">{{
                                favoriteCount }} items</span>
                            <ChevronRight :size="16" class="text-gray-400" />
                        </div>
                    </div>

                    <!-- 分隔线 -->
                    <div class="border-b border-gray-100 mx-3" v-if="item.divider && index < menuItems.length - 1">
                    </div>
                </template>

                <!-- 退出登录按钮 -->
                <div v-else-if="item.type === 'logout' && isLoggedIn"
                    class="logout-btn bg-white rounded-2xl shadow-lg flex items-center justify-center py-1 px-1 mt-1"
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
        id: 'addresses',
        icon: MapPin,
        title: 'My Addresses',
        path: '/address/list',
        iconSize: 18,
        divider: true
    },
    {
        id: 'favorites',
        icon: Heart,
        title: 'My Favorites',
        path: '/favorite',
        iconSize: 18,
        showCount: true,
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
}

.logout-btn:active {
    background-color: #f5f5f5;
    transform: scale(0.98);
}
</style>