export interface ExampleResponse {
  message: string;
}

export async function getExample(): Promise<ExampleResponse> {
  return { message: 'ok' };
}
