var FFmpeg = require("nativescript-ffmpeg").FFmpeg;

describe("greet function", function() {
    it("exists", function() {
        expect(FFmpeg.execute).toBeDefined();
    });
});