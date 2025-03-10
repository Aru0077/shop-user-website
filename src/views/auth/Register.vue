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
                  <van-form @submit="handleEmailSignup">
                        <van-cell-group inset>
                              <!-- 用户名输入框 -->
                              <van-field v-model="formData.username" name="username" label="Username"
                                    placeholder="Enter your username" :rules="rules.username"
                                    class="rounded-lg overflow-hidden bg-white" />

                              <!-- 密码输入框 -->
                              <van-field v-model="formData.password" type="password" name="password" label="Password"
                                    placeholder="Create a password" :rules="rules.password"
                                    class="rounded-lg overflow-hidden bg-white" />

                              <!-- 确认密码输入框 -->
                              <van-field v-model="formData.confirmPassword" type="password" name="confirmPassword"
                                    label="Confirm Password" placeholder="Confirm your password"
                                    :rules="rules.confirmPassword" class="rounded-lg overflow-hidden bg-white" />
                        </van-cell-group>

                        <!-- 服务条款复选框 -->
                        <div class="px-4 my-4">
                              <van-checkbox v-model="formData.agreedToTerms" shape="square" class="text-[14px]">
                                    I agree to the <router-link to="/terms" class="text-blue-600">Terms of
                                          Service</router-link> and <router-link to="/privacy"
                                          class="text-blue-600">Privacy
                                          Policy</router-link>
                              </van-checkbox>
                              <div v-if="showTermsError" class="text-red-500 text-xs mt-1">
                                    You must agree to the terms and privacy policy
                              </div>
                        </div>

                        <!-- 注册按钮 -->
                        <div style="margin: 16px;">
                              <van-button type="primary" size="normal" round block native-type="submit"
                                    :loading="isLoading">
                                    Sign Up
                              </van-button>
                        </div>
                  </van-form>

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
import { registerApi } from '@/api/user.api';

// 表单数据 
const formData = ref({
      username: '',
      password: '',
      confirmPassword: '',
      agreedToTerms: false
});

// 密码匹配验证
const validatePasswordMatch = (val) => {
      return val === formData.value.password;
};

// 定义验证规则
const rules = {
      username: [
            { required: true, message: 'Username is required' },
            { min: 3, message: 'Username must be at least 3 characters' },
            { max: 50, message: 'Username cannot exceed 50 characters' }
      ],
      password: [
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Password must be at least 6 characters' },
            { max: 50, message: 'Password cannot exceed 50 characters' }
      ],
      confirmPassword: [
            { required: true, message: 'Please confirm your password' },
            { validator: validatePasswordMatch, message: 'Passwords must match' }
      ]
};

// 状态变量 
const isLoading = ref(false);
const router = useRouter();
const showTermsError = ref(false);



// 注册处理
const handleEmailSignup = async () => {
      // 验证服务条款是否勾选
      if (!formData.value.agreedToTerms) {
            showTermsError.value = true;
            return;
      }

      showTermsError.value = false;

      try {
            isLoading.value = true;

            // 调用注册API，仅传递后端需要的字段
            await registerApi({
                  username: formData.value.username,
                  password: formData.value.password
            });

            // 显示注册成功对话框
            await showDialog({
                  title: 'Registration Successful',
                  message: 'Your account has been created successfully.',
                  confirmButtonText: 'Continue to Login',
                  confirmButtonColor: '#4f46e5',
            });

            router.push('/login');
      } catch (error: any) {
            showNotify({
                  type: 'danger',
                  message: error.response?.data?.message || 'Registration failed. Please try again later.'
            });
      } finally {
            isLoading.value = false;
      }
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