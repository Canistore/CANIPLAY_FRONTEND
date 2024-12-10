import pLimit from 'p-limit';

let audioContext = null;
class AudioChunkPlayer extends EventTarget {
    static CHUNK_SIZE = 256 * 1024 * 5;

    constructor(url) {
        super();
        this.url = url;
        this.offset = 0;
        this.status = 'pause';
        this.audioData = null;
        this.duration = 0;
        this.initialTime = 0;
        this.currentTime = 0;
        this.startTime = 0;
        this.chunks = [];
        this.controller = new AbortController();

        this.audioContext = audioContext || new AudioContext() || new webkitAudioContext();
        audioContext = this.audioContext;
        this.currentSourceNode = this.audioContext.createBufferSource();
        this.reqLimit = pLimit(3);
    }

    async play(time) {
        if (this.audioContext.state === 'closed') {
            this.audioContext = new AudioContext();
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        if (time) {
            this.initialTime = time;
            this.currentTime = time;
        }

        this.wakeLock = await navigator.wakeLock?.request('screen');
        this.status = 'loading';

        this.fileSize = await this.getFileSize(this.url);

        this.loadData();
    }

    pause() {
        console.log(' ~ AudioChunkPlayer ~ pause ~');

        this.wakeLock?.release();
        clearTimeout(this.updateTimer);
        this.status = 'pause';
        this.controller.abort('user pause');

        const event = new CustomEvent('paused');
        this.dispatchEvent(event);

        if (this.currentSourceNode && this.currentSourceNode.connected) {
            this.currentSourceNode.stop();
            this.currentSourceNode.disconnect(this.audioContext.destination);
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.suspend();
            }
            this.currentSourceNode = null;
            this.nextSourceNode = null;
            this.status = 'pause';
        }
    }

    updatePlaybackTime() {
        if (this.currentSourceNode.buffer) {
            this.currentTime = this.initialTime + this.audioContext.currentTime - this.startTime;
            const event = new CustomEvent('timeupdate', {
                detail: {
                    currentTime: this.currentTime,
                },
            });
            this.dispatchEvent(event);
        }

        if (this.currentTime >= this.duration) {
            this.status = 'pause';

            const event = new CustomEvent('ended');
            this.dispatchEvent(event);
            clearTimeout(this.updateTimer);
        }

        if ('pause' !== this.status) {
            this.updateTimer = setTimeout(() => {
                this.updatePlaybackTime();
            }, 1000);
        }
    }

    loadData() {
        for (let i = 0; i < this.fileSize; i += AudioChunkPlayer.CHUNK_SIZE) {
            this.chunks.push({
                start: i,
                end: Math.min(i + AudioChunkPlayer.CHUNK_SIZE, this.fileSize),
            });
        }

        this.chunks.forEach((chunk) => {
            this.reqLimit(() =>
                this.fetchChunk(this.url, chunk.start, chunk.end).then((buffer) => {
                    chunk.buffer = buffer;
                    this.tryPlay();
                }),
            );
        });
    }

    async fetchChunk(url, offset, end) {
        const { signal } = this.controller;
        try {
            const response = await fetch(url, {
                signal,
                headers: {
                    Range: `bytes=${offset}-${end - 1}`,
                },
            });

            if (response.status === 206) {
                const arrayBuffer = await response.arrayBuffer();
                return arrayBuffer;
            } else {
                console.error('加载音频分片失败', response.status);
            }
        } catch (error) {
            if (error === 'user pause') {
                console.log('用户暂停请求被中止');
            } else {
                console.error('加载音频分片时发生错误', error);
            }
        }
    }

    tryPlay() {
        const buffers = [];

        for (const chunk of this.chunks) {
            if (chunk.buffer) {
                buffers.push(chunk.buffer);
            } else {
                break;
            }
        }
        const combinedBuffer = concatArrayBuffers(...buffers);
        this.audioContext
            .decodeAudioData(combinedBuffer)
            .then((audioBuffer) => {
                this.duration = audioBuffer.duration;

                if (
                    audioBuffer.duration - this.currentTime > 10 ||
                    buffers.length === this.chunks.length
                ) {
                    this.playBuffer(audioBuffer);
                }
            })
            .finally(() => {
                buffers.length = 0;
            });
    }

    playBuffer(audioBuffer) {
        if ('pause' === this.status) {
            return;
        }
        this.nextSourceNode = this.audioContext.createBufferSource();
        this.nextSourceNode.buffer = audioBuffer;

        this.currentTime =
            this.initialTime +
            (this.startTime === 0 ? 0 : this.audioContext.currentTime - this.startTime);

        if (this.currentSourceNode.connected) {
            this.currentSourceNode.stop();
            this.currentSourceNode.disconnect(this.audioContext.destination);
        }

        this.currentSourceNode = this.nextSourceNode;
        this.currentSourceNode.connect(this.audioContext.destination);
        this.currentSourceNode.connected = true;

        this.currentSourceNode.start(0, this.currentTime);
        this.startTime = this.startTime === 0 ? this.audioContext.currentTime : this.startTime;
        if ('playing' !== this.status) {
            const event = new CustomEvent('canplaythrough');
            this.status = 'playing';
            this.dispatchEvent(event);
            this.updatePlaybackTime();
        }

        this.currentSourceNode.onended = () => {
            if ('playing' === this.status) {
                this.tryPlay();
            }
        };
    }

    getFileSize(url) {
        return fetch(url, {
            headers: {
                Range: 'bytes=0-1',
            },
        }).then((response) => {
            if (!response.ok) {
                console.error('无法获取文件信息', response.status);
                return Promise.reject(null);
            }
            const contentLength = response.headers.get('content-range').split('/').pop();
            return parseInt(contentLength, 10);
        });
    }
}

function concatArrayBuffers(...buffers) {
    buffers = buffers.filter((buffer) => buffer);

    const totalLength = buffers.reduce((sum, buffer) => {
        return sum + buffer.byteLength;
    }, 0);

    const newBuffer = new ArrayBuffer(totalLength);

    const newUint8Array = new Uint8Array(newBuffer);

    let offset = 0;

    buffers.forEach((buffer) => {
        newUint8Array.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    });

    return newBuffer;
}

export function play(url, currentTime = 0) {
    const player = new AudioChunkPlayer(url);
    player.play(currentTime);
    return player;
}
