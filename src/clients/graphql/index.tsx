import request from './request';
import { extractFiles } from 'extract-files';
import { XHRResponse } from '../xhr/listeners';
/* 
  Extract files is the official package used by the developer who helped
  create the graphql upload spec in apollo client / server
  code here is similar: https://github.com/jaydenseric/graphql-react/blob/1b1234de5de46b7a0029903a1446dcc061f37d09/src/universal/graphqlFetchOptions.mjs
*/

type GraphQLSetupOptions = {
  baseUrl: string;
  modifyRequest?: (request: GraphQLOptions) => GraphQLOptions;
};
export type GraphQLRequestOptions = {
  onProgress: (progress: number) => void;
  options: GraphQLOptions;
};
type Headers = {
  [key: string]: any;
};

export type GraphQLOptions = {
  mutation: any;
  variables: any;
  path?: string;
  headers?: Headers;
  onProgress: (progress: number) => void;
  withCredentials?: boolean;
};

type FileMap = {
  [x: number]: string;
};

export const createGraphQLClient = ({
  baseUrl,
  modifyRequest,
}: GraphQLSetupOptions) => ({
  onProgress,
  options,
}: GraphQLRequestOptions): Promise<XHRResponse> => {
  let modifiedOptions = modifyRequest ? modifyRequest(options) : options;

  const { clone, files } = extractFiles({
    query: options.mutation.loc.source.body,
    variables: options.variables,
  });

  var body = new FormData();
  body.append('operations', JSON.stringify(clone));

  const map: FileMap = {};
  let i = 0;
  files.forEach((paths: string) => {
    map[++i] = paths;
  });
  body.append('map', JSON.stringify(map));

  i = 0;
  files.forEach((paths: string, file: File) => {
    body.append(`${++i}`, file, file.name);
  });

  return request({
    body,
    onProgress,
    options: modifiedOptions,
    url: `${baseUrl}${options.path || ''}`,
  });
};
