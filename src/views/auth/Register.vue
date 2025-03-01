<template>
      <div class="register-page bg-gray-50 h-full flex flex-col">
            <!-- 顶部Logo区域 -->
            <div class="logo-area pt-10 pb-1 flex justify-center">
                  <van-image :src="UniMallLogo" fit="cover" class="w-8 h-8 rounded-xl shadow-md p-0.5" />
            </div>

            <!-- 欢迎文本 -->
            <div class="welcome-text text-center px-6 mb-2 mt-1">
                  <div class="text-[20px] font-bold text-gray-800 mb-1">Create Account</div>
                  <div class="text-gray-600 text-[18px]">Sign up to start shopping</div>
            </div>

            <!-- 注册表单区域 -->
            <div class="register-options px-4 flex-1">
                  <!-- 账号密码注册表单 -->
                  <form @submit.prevent="handleEmailSignup">
                        <!-- 全名输入框 -->
                        <van-field v-model="fullName" name="fullName" label="Full Name"
                              placeholder="Enter your full name"
                              :rules="[{ required: true, message: 'Full name is required' }]"
                              class="mb-1 rounded-lg overflow-hidden bg-white" />

                        <!-- 邮箱输入框 -->
                        <van-field v-model="email" name="email" label="Email" placeholder="Enter your email"
                              :rules="[{ required: true, message: 'Email is required' }]"
                              class="mb-1 rounded-lg overflow-hidden bg-white" />

                        <!-- 密码输入框 -->
                        <van-field v-model="password" type="password" name="password" label="Password"
                              placeholder="Create a password"
                              :rules="[{ required: true, message: 'Password is required' }]"
                              class="mb-1 rounded-lg overflow-hidden bg-white" />

                        <!-- 确认密码输入框 -->
                        <van-field v-model="confirmPassword" type="password" name="confirmPassword"
                              label="Confirm Password" placeholder="Confirm your password"
                              :rules="[{ required: true, message: 'Please confirm your password' }]"
                              class="mb-2 rounded-lg overflow-hidden bg-white" />

                        <!-- 服务条款复选框 -->
                        <van-checkbox v-model="agreedToTerms" shape="square" class="mb-2 text-[14px]">
                              I agree to the <router-link to="/terms" class="text-blue-600">Terms of
                                    Service</router-link> and <router-link to="/privacy" class="text-blue-600">Privacy
                                    Policy</router-link>
                        </van-checkbox>

                        <!-- 注册按钮 -->
                        <van-button type="primary" size="normal" round block native-type="submit" :loading="isLoading"
                              :disabled="!agreedToTerms" class="mb-4">
                              Sign Up
                        </van-button>
                  </form>

                  <!-- 已有账号链接 -->
                  <div class="text-center mt-1 mb-1">
                        <p class="text-gray-600 text-[14px]">
                              Already have an account?
                              <router-link to="/login" class="text-blue-600 font-medium text-[14px]">Sign
                                    In</router-link>
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
import { showNotify, showDialog } from 'vant';
import UniMallLogo from '@/assets/images/unimall.png'

// 状态变量
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreedToTerms = ref(false);
const isLoading = ref(false);
const router = useRouter();

// 邮箱密码注册处理
const handleEmailSignup = () => {
      // 验证表单
      if (!fullName.value || !email.value || !password.value || !confirmPassword.value) {
            showNotify({ type: 'warning', message: 'Please fill in all required fields' });
            return;
      }

      if (!agreedToTerms.value) {
            showNotify({ type: 'warning', message: 'Please agree to the Terms of Service' });
            return;
      }

      if (password.value !== confirmPassword.value) {
            showNotify({ type: 'danger', message: 'Passwords do not match' });
            return;
      }

      if (password.value.length < 8) {
            showNotify({ type: 'warning', message: 'Password must be at least 8 characters' });
            return;
      }

      isLoading.value = true;

      // 这里添加邮箱注册逻辑
      // 例如: 调用注册API
      setTimeout(() => {
            // 模拟注册成功
            isLoading.value = false;
            showDialog({
                  title: 'Registration Successful',
                  message: 'Your account has been created successfully.',
                  confirmButtonText: 'Continue to Shopping',
                  confirmButtonColor: '#4f46e5',
            }).then(() => {
                  router.push('/home');
            });
      }, 1500);
};
</script>

<style scoped>
/* 可以在此添加额外的样式 */
.register-page {
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

:deep(.van-checkbox) {
      margin-left: 4px;
}

:deep(.van-checkbox__label) {
      color: #4b5563;
}
</style>