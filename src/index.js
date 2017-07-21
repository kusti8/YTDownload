import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Modal,
    Button,
    StatusBar,
    Platform,
    FlatList
} from 'react-native';
import {
    Header,
    FormLabel,
    FormInput,
    FormValidationMessage,
    List,
    ListItem,
    Icon,
} from 'react-native-elements';
import VideoPlayer from 'react-native-video-controls';
import Spinner from 'react-native-spinkit';
import Izzati from 'react-native-izzati';
import RNFetchBlob from 'react-native-fetch-blob';
import store from 'react-native-simple-store';
import Swipeout from 'react-native-swipeout';
import ShareMenu from 'react-native-share-menu';

export default class YTDownload extends Component {

    state = {
        modalVisible: false,
        videoVisible: false,
        url: "",
        uri: "",
        spinnerVisible: false,
        loading: true,
        list: []
    }

    constructor(props) {
        super(props)
        this.onEnd = this.onEnd.bind(this)
        store.get('videos').then((res) => {
            this.setState({list: res})
            console.log(this.state.list)
            this.setState({loading: false})
        })
        ShareMenu.getSharedText(text => {
            if (text && text.length) {
                this.setState({ url: text }, () => {
                    this.setState({modalVisible: true}, () => {
                        this.download()
                        this.setURL("")
                        ShareMenu.clearSharedText()
                    })
                });
            }
        })
    }

    addVideo() {
        this.setState({modalVisible: true})
    }

    updateList() {
        store.get('videos').then((res) => {
            console.log(res)
            this.setState({list: res})
        })
    }

    deleteVideo(index) {
        let array = this.state.list
        o = JSON.parse(this.state.list[index])
        RNFetchBlob.fs.unlink(o.path).then(() => {
            array.splice(index, 1)
            this.setState({list: array})
            store.save('videos', array)
        })
    }

    download() {
        this.setSpinner(true)
        let i = new Izzati("http://192.168.100.113:5020/")
        i.send({text: {url: this.state.url}, response: {base64: true}}, (out) => {
            out = out.text
            RNFetchBlob
                .config({
                // response data will be saved to this path if it has access right.
                //path : (dirs.DocumentDir + '/' + out.title + '.mp4').replace(/\s/g, '')
                fileCache: true,
                appendExt: 'mp4'
                })
                .fetch('GET', out.url, {

                })
                .then((res) => {
                    data = {
                        path: res.path(),
                        thumbnail: out.thumbnail,
                        title: out.title,
                        author: out.author,
                    }
                    store.push('videos', JSON.stringify(data)).then(() => {
                        this.setState({spinnerVisible: false}, () => {
                            this.setModalVisible(false)
                            this.updateList()
                        })
                    })
            })
        });
    }

    setSpinner(visible) {
        this.setState({spinnerVisible: visible})
    }

    setURL(text) {
        this.setState({url: text})
    }

    setModalVisible(visible) {
        if (!this.state.spinnerVisible) {
            this.setState({modalVisible: visible})
        }
    }

    setVideoVisible(visible) {
        this.setState({videoVisible: visible})
        if (visible) {
            StatusBar.setHidden(true)
        } else {
            StatusBar.setHidden(false)
        }
    }

    watch(key) {
        // .slice(0, -4)
        this.setState({uri: 'file://' + key.path}, () => {
            this.setVideoVisible(true)
            StatusBar.setHidden(true)
        })
    }

    onEnd() {
        this.setState({videoVisible: false})
        StatusBar.setHidden(false)
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={styles.modalView}>
                    <Spinner type={"CircleFlip"} size={40} isVisible={true} color={'black'}/>
                    <Text>Loading...</Text>
                </View>
            )
        }
        return (
            <View style={styles.defaultView}>
                <Header
                    centerComponent={{ text: 'YTDownload' }}
                    rightComponent={{ icon: 'add', onPress: () => this.addVideo() }}
                    statusBarProps={{ barStyle: 'light-content' }}
                    outerContainerStyles={{ backgroundColor: 'red', zIndex: 1, position: 'relative' }} />
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setModalVisible(false)}}
                    >
                    <View style={styles.closeButton}>
                        <Icon name='clear' size={35} onPress={() => this.setModalVisible(false)} style={{marginTop: 10, marginRight: 10}}/>
                    </View>
                    <View style={styles.modalView}>
                        <FormLabel>Youtube Link</FormLabel>
                        <FormInput onChangeText={(text) => this.setURL(text)}/>
                        <Button title="Download" onPress={() => {this.download()}}/>
                        <Spinner type={"ThreeBounce"} size={40} isVisible={this.state.spinnerVisible} color={'black'}/>
                    </View>
                </Modal>
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.videoVisible}
                    onRequestClose={() => {
                        this.setVideoVisible(false)
                    }}
                    >
                    <View style={styles.modalView}>
                        <VideoPlayer source={{uri: this.state.uri}}   // Can be a URL or a local file.                                   // Store reference
                            resizeMode="cover"                      // Fill the whole screen at aspect ratio.*
                            playInBackground={false}                // Audio continues to play when app entering background.
                            onEnd={this.onEnd}                      // Callback when playback finishes
                            onBack={this.onEnd}
                            style={styles.backgroundVideo} />
                    </View>
                </Modal>
                <List>
                    <FlatList
                        data={this.state.list}
                        extraData={this.state}
                        renderItem={(item) => {
                                swipeoutBtns = [
                                    {
                                        text: 'Delete',
                                        backgroundColor: 'red',
                                        onPress: () => {
                                            this.deleteVideo(item.index)
                                        }
                                    }
                                ]
                            return (
                            <Swipeout right={swipeoutBtns}>
                                <ListItem
                                    roundAvatar
                                    avatar={{uri:JSON.parse(this.state.list[item.index]).thumbnail}}
                                    title={JSON.parse(this.state.list[item.index]).title}
                                    key={JSON.parse(this.state.list[item.index]).thumbnail}
                                    onPress={() => {
                                        this.watch(JSON.parse(this.state.list[item.index]))
                                    }}
                                />
                            </Swipeout>
                        )
                        }}
                        keyExtractor={(item, index) => index}
                    />
                </List>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    defaultView: {
        flex: 1,
    },
    mainView: {
        flex: 1
    },
    modalView: {
        flex: 1,
        backgroundColor: '#e8e8e8',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    closeButton: {
        backgroundColor: '#e8e8e8',
        alignItems: 'flex-end'
    }
})