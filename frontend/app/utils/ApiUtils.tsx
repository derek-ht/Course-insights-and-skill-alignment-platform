export const HTTPheaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

interface HTTPParamType {
  credentials: RequestCredentials | undefined;
  mode: RequestMode | undefined;
}

// Parameters for enabling credentials and cookies to be sent for each request
export const HTTPParams: HTTPParamType = {
  credentials: "include",
  mode: "cors",
};

type ApiMethod = "GET" | "DELETE" | "PUT" | "POST";

/** 
 * Asynchronous function for abstracting the logic for API calls
 * @params path - backend endpoint
 * @params method - HTTP Method
 * @params onSuccess - the function to call once a response has been received.
 * @params onError - the function to call if an error has been received.
 */
export const apiCall = async (
  path: string,
  method: ApiMethod,
  params: object,
  onSuccess: (value: any) => void,
  onError: (string: any) => void
) => {
  const options: any = {
    ...HTTPParams,
    method,
    headers: HTTPheaders,
  };

  if ((method === "POST" || method === "PUT") && params) {
    options.body = JSON.stringify(params);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/${path}`,
    options
  );
  if (res.ok) {
    onSuccess(await res.json());
  } else {
    const { error } = await res.json();
    onError(error);
  }
};
