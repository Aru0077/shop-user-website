<template>
    <div class="login-page bg-gray-50 h-full flex flex-col">
        <!-- 顶部Logo区域 -->
        <div class="logo-area pt-10 pb-1 flex justify-center">
            <van-image :src="UniMallLogo" fit="cover" class="w-8 h-8 rounded-xl shadow-md p-0.5" />
        </div>

        <!-- 欢迎文本 -->
        <div class="welcome-text text-center px-6 mb-2 mt-1">
            <div class="text-[20px] font-bold text-gray-800 mb-1">Welcome Back</div>
            <div class="text-gray-600 text-[18px]">Sign in to continue shopping</div>
        </div>

        <!-- 登录选项区域 -->
        <div class="login-options px-4 flex-1">
            <!-- Facebook登录按钮 -->
            <button
                class="w-full bg-blue-600 text-white py-1 rounded-lg flex items-center justify-center mb-2 shadow-md text-[16px]"
                @click="handleFacebookLogin">
                <svg class="w-2 h-2 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
                Continue with Facebook
            </button>

            <!-- 分隔线 -->
            <div class="divider flex items-center my-2">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="px-4 text-[14px] text-gray-500">OR</span>
                <div class="flex-1 h-px bg-gray-300"></div>
            </div>

            <!-- 账号密码登录表单 -->
            <form @submit.prevent="handleEmailLogin">
                <!-- 邮箱输入框 -->
                <van-field v-model="email" name="email" label="Email" placeholder="Enter your email"
                    :rules="[{ required: true, message: 'Email is required' }]"
                    class="mb-1 rounded-lg overflow-hidden bg-white" />

                <!-- 密码输入框 -->
                <van-field v-model="password" type="password" name="password" label="Password"
                    placeholder="Enter your password" :rules="[{ required: true, message: 'Password is required' }]"
                    class="mb-2 rounded-lg overflow-hidden bg-white" />

                <!-- 登录按钮 -->
                <van-button type="primary" size="normal" round block native-type="submit" :loading="isLoading"
                    class="mb-4">
                    Sign In
                </van-button>
            </form>

            <!-- 忘记密码和注册链接 -->
            <div class="text-center mt-1 mb-1">
                <router-link to="/forgot-password" class="text-[14px] text-blue-600">Forgot Password?</router-link>
                <p class="mt-1 text-gray-600 text-[14px]">
                    Don't have an account?
                    <router-link to="/register" class="text-blue-600 font-medium text-[14px]">Sign Up</router-link>
                </p>
            </div>
        </div>

        <!-- 底部版权信息 -->
        <div class="footer py-2 text-center text-[14px] text-gray-500">
            <p>© 2025 Uni - Mall. All rights reserved.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showNotify } from 'vant';
import UniMallLogo from '@/assets/images/unimall.png'

// 状态变量
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const router = useRouter();

// Facebook登录处理
const handleFacebookLogin = () => {
    isLoading.value = true;

    // 这里添加Facebook登录逻辑
    // 例如: 调用OAuth API或SDK
    setTimeout(() => {
        // 模拟登录成功
        isLoading.value = false;
        showNotify({ type: 'success', message: 'Facebook login successful' });
        router.push('/home');
    }, 1500);
};

// 邮箱密码登录处理
const handleEmailLogin = () => {
    if (!email.value || !password.value) {
        showNotify({ type: 'warning', message: 'Please enter email and password' });
        return;
    }

    isLoading.value = true;

    // 这里添加邮箱登录逻辑
    // 例如: 调用登录API
    setTimeout(() => {
        // 模拟登录成功
        isLoading.value = false;
        showNotify({ type: 'success', message: 'Login successful' });
        router.push('/home');
    }, 1500);
};
</script>

<style scoped>
/* 可以在此添加额外的样式 */
.login-page {
    background-image: linear-gradient(to bottom, #fff, #e2e8f0);
}

/* 确保vant组件样式与设计一致 */
:deep(.van-field) {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.van-button--primary) {
    background: linear-gradient(to right, #4f46e5, #6366f1);
    border: none;
}
</style>