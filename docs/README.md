<p style="color:green; font-size: 38px; text" id="demo1"></p>

# 帮助说明
Markdown是一种使用纯文本的方式表达文本、格式、表格、代码、链接的文本格式。

可以使用**在线文档编辑工具**，编写文档。<http://www.mdeditor.com/>

该类型文件以.md的格式结尾。 可以很方便的转化成web上可以查看的静态网站

本文都只介绍了一种格式的表达方式

<div>
    <iframe src="./res/2.5A平面图纸.pdf" width="100%" height="600px" >
    </iframe>
</div>
<div>
    <iframe src="./res/韩国闻庆项目案例目录.doc" width="100%" height="600px"  >
    </iframe>
</div>
<div>
    <iframe src="./res/2020-06-11 10-24-34.mp4" width="100%" height="100%"  >
    </iframe>
</div>



*********
## 添加各层级标题
使用 # 号可表示 1-6 级标题，一级标题对应一个 # 号，二级标题对应两个 # 号，见下图。 **注意#后面要跟一个空格**。
```
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```
*********
## 段落
在该语法中，**段落后面使用一个空行**才能表示重新开始一个段落

*********
## 列表
### 无序列表
使用(- ) 注意符号后面必须跟一个空格

- 列表内容1
- 列表内容2

### 有序列表
使用序号加'.'加空格

1. 有序内容
2. 有序内容

### 嵌套列表
列表嵌套只需在子列表中的选项前面添加4个空格即可
```
1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素
  ```
*********
## 图片、视频
- 图片的资源文件保存到本仓库的res文件夹中
- 开头一个感叹号 !
- 接着一个方括号，里面放上图片的替代文字
- 接着一个普通括号，里面放上图片的网址，最后还可以用引号包住并加上选择性的 'title' 属性的文字
- 也可以直接引用网上的图片链接

![芯板](http://www.broad.com/Storage/uploads/201704/bxgxbjj_4.jpg)

<iframe 
    width=800
    height=650
    src="./res/2020-06-11 10-24-34.mp4"
    frameborder="0" 
    allowfullscreen>
</iframe>




<iframe 
    width=800 
    height=650 
    src="//player.bilibili.com/player.html?aid=795925374&bvid=BV1FC4y1a7H3&cid=201194225&page=1"
    frameborder="0" 
    allowfullscreen>
</iframe>


**********
## 更多内容见：<https://www.runoob.com/markdown/md-tutorial.html>
