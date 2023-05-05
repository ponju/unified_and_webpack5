import path, { dirname } from 'path';
import { merge } from 'webpack-merge';
import common,{__dirname,__filename} from './webpack.common.mjs';

const merged =merge(common, {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
});

export default merged;