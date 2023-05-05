import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path'
import common,{__filename,__dirname} from './webpack.common.mjs';

const merged=merge(common, {
    mode: 'production',
    //最適化設定
    output: {
      path: path.resolve(__dirname, "public"),
      filename: "main.js",
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress:{
                        drop_console: true
                    }
                }
            })
        ]
    }
});

export default merged;