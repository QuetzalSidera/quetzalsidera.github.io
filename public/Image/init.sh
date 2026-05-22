#!/bin/bash

ROOT_DIR="./"

CURRENT_DIR="$(pwd)"

log() {
    printf '[INFO] %s\n' "$1"
}

error() {
    printf '[ERROR] %s\n' "$1" >&2
}

# =========================================================
# 查找 public 父目录
# =========================================================

PUBLIC_DIR=$(echo "$CURRENT_DIR" | awk '
{
    path=$0

    while (path != "/") {

        if (system("[ -d \"" path "/public\" ]") == 0) {
            print path "/public"
            exit
        }

        sub("/[^/]+$", "", path)
    }
}
')

if [ -z "$PUBLIC_DIR" ]; then
    error "Cannot find parent public directory."
    exit 1
fi

log "Public directory: $PUBLIC_DIR"

# =========================================================
# PREFIX
# =========================================================

RELATIVE_PATH="${CURRENT_DIR#$PUBLIC_DIR}"
PREFIX="$RELATIVE_PATH"

log "Resolved prefix: $PREFIX"

# =========================================================
# 文件列表
# =========================================================

FILES=$(find "$ROOT_DIR" -type f -iname "*.webp" \
    | sed 's|^\./||' \
    | sort -V)

if [ -z "$FILES" ]; then
    error "No .webp files found."
    exit 1
fi

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')

log "Discovered $FILE_COUNT webp file(s)."
# =========================================================
# path.json
# =========================================================

log "Generating path.json"

{
    echo "{"

    echo "$FILES" | awk -v prefix="$PREFIX" '

    {
        path=$0

        # 文件夹
        dir=path
        sub(/\/[^\/]+$/, "", dir)

        # 文件名
        filename=path
        sub(/^.*\//, "", filename)

        # key
        key=filename
        sub(/\.[^.]+$/, "", key)

        value=prefix "/" path

        gsub(/"/, "\\\"", key)
        gsub(/"/, "\\\"", value)

        # 不同文件夹之间空行
        if (dir != last_dir) {

            if (NR != 1) {
                print ""
            }

            last_dir=dir
        }

        printf "  \"%s\": \"%s\",\n", key, value
    }
    ' | sed '$ s/,$//'

    echo "}"

} > path.json

# =========================================================
# path.ts
# =========================================================

log "Generating path.ts"

{
    echo "export const path = {"

    echo "$FILES" | awk -v prefix="$PREFIX" '

    function is_valid_identifier(s) {
        return s ~ /^[A-Za-z_$][A-Za-z0-9_$]*$/
    }

    {
        path=$0

        # 文件夹
        dir=path
        sub(/\/[^\/]+$/, "", dir)

        # 文件名
        filename=path
        sub(/^.*\//, "", filename)

        # key
        key=filename
        sub(/\.[^.]+$/, "", key)

        value=prefix "/" path

        # 输出文件夹注释
        if (dir != last_dir) {

            if (NR != 1) {
                print ""
            }

            printf "  // %s/%s\n", prefix, dir

            last_dir=dir
        }

        gsub(/"/, "\\\"", key)
        gsub(/"/, "\\\"", value)

        if (is_valid_identifier(key)) {
            printf "  %s: \"%s\",\n", key, value
        } else {
            printf "  \"%s\": \"%s\",\n", key, value
        }
    }
    '

    echo "} as const;"

} > path.ts

# =========================================================
# 完成
# =========================================================

log "Generated:"
log "  $(pwd)/path.json"
log "  $(pwd)/path.ts"

log "Completed successfully."
