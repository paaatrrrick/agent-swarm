//@ts-nocheck

import React from 'react'
import VideoJS from '@/components/home/VideoJS';
// This imports the functional component from the previous sample.

const Videoplayer = ({ path }: { path: string }) => {
    const playerRef = React.useRef(null);

    //live stream video from path http://45.56.104.109/hls/teststream.m3u8
    const videoJsOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: path,
            type: 'application/x-mpegURL'
        }]
    }

    const handlePlayerReady = (player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            videojs.log('player is waiting');
        });

        player.on('dispose', () => {
            videojs.log('player will dispose');
        });
    };

    return <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />;
}


export default Videoplayer;