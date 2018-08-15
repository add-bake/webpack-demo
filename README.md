# webpack-demo
1. 因为修改了 jquery-weui 和 weui 的源码，所以不要直接引用 npm 包里边的 jquery-weui 和 weui，要使用静态资源中的文件
2. 打包之后需要手动修改css文件中的路径，例如"image/bottom.png"需要改为"../images/bottom.png"(webpack使用bug，暂未找到比较好的解决方案)
3. 接口路径需要手动修改为线上正式的接口路径（basePath变量）
