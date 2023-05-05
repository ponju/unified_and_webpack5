import fs from "fs";
import path from "path";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { htmlWebpackPluginTemplateCustomizer } from "template-ejs-loader";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import yaml from "yaml";
import remarkFrontmatter from "remark-frontmatter";
import remarkFrontmatterPlugin from "remark-extract-frontmatter";

export const __filename=fileURLToPath(import.meta.url);
export const __dirname=dirname(__filename);

const websiteName="My Aweful Page";

const plugins = [
    new HtmlWebpackPlugin({
        title: websiteName,
        hash: true,
        template: htmlWebpackPluginTemplateCustomizer(
            {
                templatePath:path.resolve(__dirname,"src","pages","my-page.ejs"),
                htmlLoaderOption:{

                },
                templateEjsLoaderOption:{
                    data:{
                        title:websiteName,
                        contents:"HOGE"
                    }
                }
            }
        )
    }),
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin()
];

const processor=unified();

processor
    .use(remarkParse)
    .use(remarkFrontmatter,[{
        type:'yaml',
        marker:'-',
        anywhere:false
    }])
    .use(remarkFrontmatterPlugin,{
        yaml:yaml.parse,
        name:'frontMatter'
    })
    .use(remarkRehype)
    .use(rehypeStringify);

const markdownGroup="article";

const markdownDirPath=path.join(__dirname,markdownGroup);
const markdownFileNames=fs.readdirSync(path.join(__dirname,markdownGroup));
const markdownFiles=markdownFileNames.map(md=>
    fs.readFileSync(path.join(markdownDirPath,md),{encoding:"utf-8"})
);
const articles=markdownFiles.map(
    a=>processor.processSync(a)
);

const publicPath= "/";
const articlePlugins=articles.map(
    file=>    
    new HtmlWebpackPlugin({
        title: file.data.frontMatter.title,
        hash: false,
        publicPath:publicPath,
        filename:file.data.frontMatter.slug+".html",
        template: htmlWebpackPluginTemplateCustomizer(
            {
                templatePath:path.resolve(__dirname,"src","pages","my-page.ejs"),
                htmlLoaderOption:{

                },
                templateEjsLoaderOption:{
                    data:{
                        title:file.data.frontMatter.title,
                        slug:file.data.frontMatter.slug,
                        published:file.data.frontMatter.published,
                        latestUpdated:file.data.frontMatter.latestUpdated,
                        contents:file.value
                    }
                }
            }
        )
    }),
)

articlePlugins.forEach(el=>plugins.push(el));

const common={
    entry: "./src/main.ts",
    //各拡張子のファイルへ作用するローダーを記述
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                { modules: false },
                            ]
                        ]
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                }
            },
            //htmlのバンドル
            {
                test: /\.html$/,
                loader: "html-loader"
            },
            //scss
            {
                test: /\.(s[ac]ss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ],
            },
            //静的ファイル。Asset Modulesを利用
            {
                test: /\.(jpe?g|gif|png|svg|mp4|json)$/,
                generator: {
                    filename: "./resources/[name][ext]",
                },
                type: "asset/resource",
            },
        ]
    },
    //ライブラリー参照を解決するための記述
    resolve: {
        modules: ["/node_modules"],
        extensions: [".tsx", ".ts", ".js", ".scss"],
    },
    plugins: plugins
};
export default common;