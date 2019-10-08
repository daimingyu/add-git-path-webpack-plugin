const fs = require('fs');

class AAWebpackPlugin {
    isJs(fileName) {
        //js 正则
        const jsRegex = /\.(js|jsx)?$/;
        return jsRegex.test(fileName);
    }
    isCss(fileName) {
        //css 正则
        const cssRegex = /\.css$/;
        return cssRegex.test(fileName);
    }
    getGitPath() {
        return new Promise((resolve, reject) => {
            fs.readFile(".git/config", "utf-8", function(err, data) {
                console.log(err);
                console.log(data);
                if (err) {
                    resolve(null);
                }else{
                    let ifAddOrigin = data.split("url")[1] ? true : false ;
                    ifAddOrigin ? resolve(data.split("url")[1].split(".git")[0].split(":")[1]) : resolve(null) ;
                }
            })
        });
    }
    apply(compiler) {
        compiler.plugin('emit', async (compilation, callback) => {

            // 读取输出资源文件名
            // [ 'static/css/main.389ba845173c58a8.css',
            //   'static/js/main.389ba845173c58a8.js',
            //   'index.html',
            //   '1.txt' ]
            let optPath = Object.keys(compilation.assets);

            //js文件处理队列
            let jsStack = [];

            //css文件处理队列
            let cssStack = [];

            //git路径
            let gitPath = await this.getGitPath();

            console.log(gitPath);

            if(!gitPath){
                //没有初始化git，则不进行后续操作
                console.log('没有初始化git');
            }else{
                optPath.map((item) => {
                    this.isJs(item) && jsStack.push(item);
                    this.isCss(item) && cssStack.push(item);
                });
    
                //修改输出的js内容
                jsStack.map((fileName) => {
                    let fileContent = compilation.assets[fileName].source();
                    fileContent += ('\n\n' + '/*' + gitPath + '*/');
                    compilation.assets[fileName] = {
                        // 返回文件内容
                        source: () => {
                            // fileContent 既可以是代表文本文件的字符串，也可以是代表二进制文件的 Buffer
                            return fileContent;
                        },
                        // 返回文件大小
                        size: () => {
                            return Buffer.byteLength(fileContent, 'utf8');
                        }
                    };
                })
    
                //修改输出的js内容
                cssStack.map((fileName) => {
                    let fileContent = compilation.assets[fileName].source();
                    fileContent += ('\n\n' + '/*' + gitPath + '*/');
                    compilation.assets[fileName] = {
                        // 返回文件内容
                        source: () => {
                            // fileContent 既可以是代表文本文件的字符串，也可以是代表二进制文件的 Buffer
                            return fileContent;
                        },
                        // 返回文件大小
                        size: () => {
                            return Buffer.byteLength(fileContent, 'utf8');
                        }
                    };
                })
            }

            callback();
        });
    }
}
// 导出插件 
module.exports = AAWebpackPlugin;