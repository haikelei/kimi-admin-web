﻿import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { history } from '@@/core/history';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure {
  data?: any;
  code: number;
  msg?: string;
}

// 处理token的请求拦截器
const tokenRequestInterceptor = (url, options) => {
  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  return {
    url,
    options: {
      ...options,
      headers: {
        ...options.headers,
        ...authHeader,
      },
    },
  };
};

// 专门处理 token 的拦截器
const loginUrls = ['loginByPWD', 'loginBySMS'];
const tokenInterceptor = (response) => {
  console.log('response=>', response);
  const { config, data } = response;
  const { url } = config;
  const isLoginUrl = loginUrls.some((loginUrl) => url.includes(loginUrl));
  if (isLoginUrl && data && data.data && data.data.token) {
    localStorage.setItem('token', data.data.token); // 将token存储到本地存储中
  }
  return response;
};

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const requestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage } = res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, data: {} };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          if (errorCode === 10005 || errorCode === 10002) {
            const loginPath = '/user/login';
            history.push(loginPath);
          }
          message.error(errorMessage);
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [tokenRequestInterceptor],

  // 响应拦截器
  responseInterceptors: [
    tokenInterceptor,
    (response) => {
      return response;
    },
  ],
};
