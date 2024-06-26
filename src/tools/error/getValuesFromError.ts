import type { TCustomError } from '../../types';
import getLinkError from './getLinkError';
import stringifyMessage from './stringifyMessage';

export type TValues = {
  code: string;
  cause: string;
  message: string;
  link?: string;
};

const getValuesFromError = (error: TCustomError = new Error()): TValues => {
  const { code, cause, message } = error;
  const link = getLinkError(error);
  const values: TValues = { code: '', cause: '', message: '' };

  if (typeof message === 'object' && message !== null) {
    values.message = stringifyMessage(message);
  } else if (message) {
    values.message = String(message);
  }

  if (link) {
    values.link = link;
  }

  if (code) {
    values.code = code;
  }

  if (cause) {
    values.cause = cause as string;
  }

  return values;
};

export default getValuesFromError;
