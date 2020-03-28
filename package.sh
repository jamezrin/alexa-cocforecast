#!/usr/bin/env bash
set -e

TARGET_PKG=package.zip
VENDOR_DIR=node_modules
SRC_DIR=src

function clean_package() {
    echo -n "deleting already built package..."
    [ -f $TARGET_PKG ] && rm -f $TARGET_PKG
    echo "  OK  "
}

function package() {
    echo "creating package..."
    zip -r $TARGET_PKG $VENDOR_DIR $SRC_DIR && echo "Successfully created package"
}

clean_package && package