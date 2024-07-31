// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

// 发送验证码
export async function sendLoginSMSApi(phone: string) {
  return request('/admin-server/auth/sendLoginSMS', {
    method: 'POST',
    data: { phone },
  });
}

// 手机号+验证码登录
export async function loginBySMSApi(phone: string, smsCode: string) {
  return request('/admin-server/auth/loginBySMS', {
    method: 'POST',
    data: { phone, smsCode },
  });
}

// 账号密码登录
export async function loginByPasswordApi(account: string, password: string) {
  return request('/admin-server/auth/loginByPWD', {
    method: 'POST',
    data: {
      account,
      password,
    },
  });
}
