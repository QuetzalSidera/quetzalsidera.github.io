#!/bin/zsh

setopt nullglob

# 当前目录绝对路径
SRC_DIR="$(pwd)"

# 当前文件夹名称
CURRENT_DIR_NAME="${SRC_DIR:t}"

# 父目录
PARENT_DIR="${SRC_DIR:h}"

# 输出目录：父目录/当前文件夹-Convert
OUT_DIR="${PARENT_DIR}/${CURRENT_DIR_NAME}-Convert"

mkdir -p "$OUT_DIR"

# 递归查找图片
find "$SRC_DIR" -type f \( \
    -iname "*.png" -o \
    -iname "*.jpg" -o \
    -iname "*.jpeg" \
\) | while read -r file; do

    # 相对路径（相对于当前目录）
    rel_path="${file#$SRC_DIR/}"

    # 去掉扩展名
    rel_no_ext="${rel_path%.*}"

    # 输出 webp 路径
    out_file="$OUT_DIR/${rel_no_ext}.webp"

    # 创建目标子目录
    mkdir -p "${out_file:h}"

    echo "Converting:"
    echo "  $file"
    echo "-> $out_file"

    # 转换
    cwebp "$file" -q 85 -o "$out_file"

done

echo
echo "全部转换完成"
echo "输出目录：$OUT_DIR"
