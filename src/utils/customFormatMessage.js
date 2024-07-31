// utils/customFormatMessage.js

import { formatMessage as originalFormatMessage } from 'umi';

const customFormatMessage = (descriptor, values) => {
  try {
    return originalFormatMessage(descriptor, values);
  } catch (error) {
    if (error.message.includes('Missing message')) {
      return descriptor.defaultMessage || '';
    }
    throw error;
  }
};

export default customFormatMessage;
