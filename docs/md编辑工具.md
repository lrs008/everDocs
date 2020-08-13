# 文档编辑工具安装及使用

## typora编辑器，安装包链接：

 [typora-setup-x64.exe](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/typora-setup-x64.exe) 

下载后按默认设置安装

## 下载picgo.exe 

 [picgo.exe](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/picgo.exe) 

直接下载到**D盘根目录**

## typora配置

配置目的：使typora用到的图片自动上传，并自动使用网络链接。

安装好typora,打开软件，对软件进行配置。

依次点击  [文件]->[偏好设置]，  进入偏好设置界面。

![image-20200721110513847](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/image-20200721110513847.png)

1. 点击[图片]页签
2. 勾选“优先使用相对路径”
3. 勾选“插入时自动转义图片URL”
4. 上传服务的下拉框选择“PigGo-Core(command line)”
5. ~~点击按钮[下载或更新], 弹出提示时确认进行下载。（可能要翻墙才比较快）~~
   - 这一步因为不翻墙速度太慢，删掉了，直接给了picgo.exe的下载链接在上文。
6. 点击按钮[打开配置文件]，配置如下
   - 如果没有可以打开.json的软件，选择使用记事本打开即可。
   - accessKeyId和accessKeySecret需找相关人员进行提供。
   - 注意配置中的“**path**”中，“**自己的工号**”换成**自己实际的工号**
   - 配置复制进去后，**一定要 crtl+s 进行保存**

```
 {
    "picBed": {
      "uploader": "aliyun",
      "aliyun": {
        "accessKeyId": "xxxxxxxxxx",
        "accessKeySecret": "xxxxxxxxxx",
        "bucket": "5docs", 
        "area": "oss-cn-shanghai",
        "path": "res/typora/自己的工号/", 
        "customUrl": "https://5docs.oss-cn-shanghai.aliyuncs.com", 
        "options": ""
      }
    },
    "picgoPlugins": {}
}
```

![image-20200721111441324](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/image-20200721111441324.png)

7. "上传服务" 下拉列表中选中：“Custom Command” ,
8. “自定义命令”输入框中输入：“D:\picgo.exe u ”
   - 注意picgo.exe 因为上文提示下载到D盘根目录，所以这里才是这个路径。
   - 注意 "picgo.exe u "  这里， **u**的**前后各有一个空格**，一定要有。

9. 点击按钮[验证图片上传服务] ，若提示成功，表示配置成功。
10. 配置成功后，返回主界面进行文档编辑。注意编辑中如果弹出提示框，选择”上传图片“。

## typora的使用

- 编辑之后，直接显示网页上的样式，所见即所得。

- 不需要markdown知识，就可以利用功能栏的功能来编辑markdown文档。

- 可以直接讲本地的文件拖到typora编辑区中，会自动将图片上传，并生成网络图片链接。

- 可以截图之后直接复制到typora编辑区，会自动上传图片，生成网络图片链接。

- 可以直接加入外部窗口，比如b站或sketchfab的嵌入代码，并显示效果

  ## 文档上传

  网址：http://git.bsbcore.com/bcoreall/everdocs/tree/master/docs

  账号：密码： (找物联网部提供)

  新建文件(注意文件要放在docs文件夹)：

  ![image-20200721113509926](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/image-20200721113509926.png)

  ![image-20200721113740407](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/image-20200721113740407.png)

  将文件加入配置，使其可以在查看端显示。

  1. 找到_sidebar.md文件，单击查看。

     ![image-20200721113945509](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/image-20200721113945509.png)

  

  2. 点击Edit按钮

  ![image-20200721114048833](https://5docs.oss-cn-shanghai.aliyuncs.com/res/typora/image-20200721114048833.png)

  3. 配置文件中，采用一定的层级结构来表示左侧的导航栏。 找到自己新建的文件所在的层级位置。新增一条数据，使用 [链接名称]+(文件路径/文件名)的形式， 修改后保存。如果操作正确，此时自己新增的那一条是蓝色，且可以进行点击。

     ## 查看效果

     在网址http://5d.bsbcore.com/#/  查看你的改动是否生效。（这里有几分钟的延迟）

  

##  引用pdf、视频的方式

采用下文代码段的形式，将下文代码段中的地址替换成自己的文件的地址即可。 

```
<iframe src="https://5docs.oss-cn-shanghai.aliyuncs.com/res/V4.2/2.结构/上长梁 Model (1).pdf" width="100%" height="900px" >
</iframe>
```

如果是自己本地的文件，还没有网络地址的， 上传到公司OSS，即可获得网络地址。

## oss上传
下载 oss browser <https://www.alibabacloud.com/help/tc/doc-detail/61872.htm>

AccessKey ID： LTAI4G7LVhevffsbjxao7bTQ

SECRET： iud6iIQpJlIAjXNJ2SR5mW0u8d10vF

上传位置： oss://5docs/res/
