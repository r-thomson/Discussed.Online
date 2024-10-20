FROM denoland/deno:2.0.0

ARG PORT=8000
EXPOSE $PORT

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
# COPY deps.ts .
# RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --reload main.ts

CMD ["run", "--cached-only", "--allow-env", "--allow-net", "--allow-read", "--allow-write", "--allow-sys", "main.ts"]
