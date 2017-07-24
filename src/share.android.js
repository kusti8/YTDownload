import React, { Component } from 'react';
import ShareMenu from 'react-native-share-menu';

export default class Share {
    static getSharedText(callback) {
        ShareMenu.getSharedText(callback)
    }
    static clearSharedText() {
        ShareMenu.clearSharedText()
    }
}