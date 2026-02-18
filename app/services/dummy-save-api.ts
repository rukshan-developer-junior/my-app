import { httpPost } from "./https-service";

export async function dummySavePersonApi(dummySuccess = true): Promise<void> {
  await httpPost<unknown>("dummy-save", {}, { dummySuccess });
}
