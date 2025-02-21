/* eslint-disable @typescript-eslint/no-explicit-any */
import ky, { type SearchParamsOption } from 'ky';

interface IRequestArgs {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  baseUrl: string;
  url: string;
  params: SearchParamsOption;
  headers: HeadersInit;
  data: any;
  onFailed: (e?: any) => void;
}

const checkJsonData = (data: unknown) => {
  if (
    data instanceof FormData ||
    data instanceof ReadableStream ||
    data instanceof Blob ||
    data instanceof ArrayBuffer
  ) {
    return false;
  }
  return true;
};

async function request<T = any>(args: Partial<IRequestArgs>) {
  const method = args.method ?? 'GET';

  const data = checkJsonData(args.data)
    ? {
        json: args.data,
      }
    : {
        body: args.data as BodyInit,
      };

  try {
    return (await (
      await ky(`${args.baseUrl ?? ''}${args.url ?? ''}`, {
        method,
        searchParams: args.params,
        headers: args.headers,
        ...data,
      })
    ).json()) as unknown as T;
  } catch (e) {
    args.onFailed?.(e);
  }
}

export { request };
