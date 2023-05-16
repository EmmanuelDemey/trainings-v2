import { Context } from "https://edge.netlify.com";
import { basicAuth } from "https://deno.land/x/basic_auth@v1.1.1/mod.ts";

const askForAuthorization = () => {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Realm"',
    },
  });
};

export default (request: Request, context: Context) => {
  const needAuth = !!Deno.env.get("NETLIFY_AUTH_USERNAME");
  if(!needAuth){
    return context.next();
  }

  const authorization = request.headers.get("Authorization");

  if (!authorization || authorization.indexOf("Basic ") === -1) {
    return askForAuthorization();
  }

  const unauthorized = basicAuth(request, "Access to my site", {
    [Deno.env.get("NETLIFY_AUTH_USERNAME")]: Deno.env.get("NETLIFY_AUTH_PASSWORD"),
  });

  if (unauthorized) {
    return askForAuthorization();
  }
  return context.next();
};

