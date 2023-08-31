import { HonoRequest } from "hono";
import { FormData } from "formdata-polyfill/esm.min.js";

// TODO: hopefully solved with https://github.com/honojs/hono/pull/1393

export type BodyData = Record<string, string | File>;

export const parseBody = async <T extends BodyData = BodyData>(
  request: HonoRequest | Request
): Promise<T> => {
  let body: BodyData = {};
  const contentType = request.headers.get("Content-Type");

  if (
    contentType &&
    (contentType.startsWith("multipart/form-data") ||
      contentType.startsWith("application/x-www-form-urlencoded"))
  ) {
    const formData = await request.formData();
    if (formData) {
      const form: BodyData = {};
      formData.forEach((value, key) => {
        form[key] = value;
      });
      body = form;
    }
  }
  return body as T;
};

const _decodeURIComponent = decodeURIComponent;

const arrayBufferToFormData = (
  arrayBuffer: ArrayBuffer,
  contentType: string
) => {
  const decoder = new TextDecoder("utf-8");
  const content = decoder.decode(arrayBuffer);
  const formData = new FormData();

  const boundaryMatch = contentType.match(/boundary=(.+)/);
  const boundary = boundaryMatch ? boundaryMatch[1] : "";

  if (contentType.startsWith("multipart/form-data") && boundary) {
    const parts = content.split("--" + boundary).slice(1, -1);
    for (const part of parts) {
      const [header, body] = part.split("\r\n\r\n");
      const nameMatch = header.match(/name="([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        formData.append(name, body.trim());
      }
    }
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    const pairs = content.split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      formData.append(_decodeURIComponent(key), _decodeURIComponent(value));
    }
  }

  return formData;
};

export async function getFormData(request: HonoRequest) {
  const contentType = request.headers.get("Content-Type");

  if (
    contentType &&
    (contentType.startsWith("multipart/form-data") ||
      contentType.startsWith("application/x-www-form-urlencoded"))
  ) {
    const arrayBuffer = await request.raw.arrayBuffer();
    const formData = arrayBufferToFormData(arrayBuffer, contentType as string);
    return formData;
  }

  return new FormData();
}
