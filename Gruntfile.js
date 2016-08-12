/**
 * @since 2016-08-10 21:43
 * @author Jerry.hou
 */
module.exports = function(grunt){

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        /**
         * 基础配制信息
         */
        config: {
          folder: 'release',
          ip: 'http://127.0.0.1',
          port: 8888,
          livereload: 35740
        },
        /**
         * 版权信息
         */
        banner: '/** \n * <%= pkg.name %> - v<%= pkg.version %> \n' +
                ' * Create Date -<%= grunt.template.today("yyyy-mm-dd HH:MM:dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> \n */\n',
        /**
         * less文件编译
         */
        less: {
            dev: {
                files: {
                    "<%= config.folder %>/assets/css/app.min.css": "app/assets/**/*.less"
                }
            }
        },
        /**
         * css 压缩
         */
        cssmin: {
            dev: {
                options: {
                    banner: '<%= banner %>'
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.folder %>/assets/css/',
                    src: '*.css',
                    dest: '<%= config.folder %>/assets/css/'
                }]
            }
        },
        /**
         * 处理浏览器兼容
         */
        autoprefixer: {
            dev: {
                options: {
                    browsers: [
                        'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'
                    ]
                },
                src: '<%= config.folder %>/assets/css/*.css',
                dest: '<%= config.folder %>/assets/css/app.min.css'
            }
        },
        /**
         * 合并文件
         */
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= banner %>',
            },
            dev: {
                src: [
                        'app/script/base/api.js',
                        'app/script/base/tool.js',
                        'app/script/base/urls.js',
                        'app/script/component/**/*.js'
                    ],
                dest: '<%= config.folder %>/script/app.min.js',
            },
        },
        /**
         * JS 压缩
         */
        uglify: {
            options: {
                mangle: true,//{ except: ['jQuery', 'Backbone', '_', 'Cdss'] }
                banner: '<%= banner %>'
            },
            dev: {
                files: {
                    '<%= config.folder %>/script/app.min.js': ['<%= config.folder %>/script/app.min.js']
                }
            }
        },
        /**
         * 静态文件服务器
         */
        connect: {
            server: {
                options: {
                    // 经过测试 connect插件会依照base的定义顺序检索文件
                    // 这意味着如果存在相同文件，定义在前面的会优先返回
                    base: ['<%= config.folder %>', '.'],
                    port: '<%= config.port %>',
                    open: '<%= config.ip+ ":" +config.port %>/',
                    livereload: '<%= config.livereload%>',
                    hostname: '*',
                    middleware: function(connect, options, middlewares) {
                        // inject a custom middleware into the array of default middlewares 
                        middlewares.unshift(function(req, res, next) {
                        // if (req.url !== '/hello/world') return next();
                        // res.end('Hello, world from port #' + options.port + '!');
                            return next();
                        });
                      return middlewares;
                    }
                }
            }
        },
        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'app/assets/images',
                    flatten: true,
                    src: '**/*',
                    dest: '<%= config.folder %>/assets/images/'
                },{
                    expand: true,
                    cwd: 'app/mockdata',
                    flatten: true,
                    src: '**/*',
                    dest: '<%= config.folder %>/mockdata/'
                },{
                    expand: true,
                    cwd: 'app',
                    src: ['*.html'],
                    dest: '<%= config.folder %>'
                }]
            },
            //watch 时单独处理的任务
            appHtml: {
                expand: true,
                cwd: 'app',
                src: ['*.html'],
                dest: '<%= config.folder %>'
            }
        },
        /**
         * 监听Task改变并执行对应的Task
         */
        watch: {
            options: {
                livereload: '<%= config.livereload%>'
            },
            less: {
                files: "app/assets/less/**/*.less",
                tasks: ["less:dev"]
            },
            component: {
                files: "app/script/**/*",
                tasks: ["concat:dev"]
            },
            appHtml: {
                files: "app/*.html",
                tasks: ["copy:appHtml"]
            }
        },
        /**
         *  清理目录
         */
        clean: {
            dev:['<%= config.folder %>'],
            not:[
                    '<%= config.folder %>/assets/less',
                    '<%= config.folder %>/script/base',
                    '<%= config.folder %>/script/component'
                ]
        }
    });
    /**
     * 开发模式
     */
    grunt.registerTask('default', function () {
        grunt.task.run(['clean:dev', 'less:dev', 'copy:dev', 'concat:dev', 'connect:server', 'watch']);
    });

    /**
     * 打包上线
     */
    grunt.registerTask('release', function () {
        grunt.task.run(['clean:dev', 'concat:dev', 'uglify:dev', 'less:dev', 'autoprefixer:dev', 'cssmin:dev', 'clean:not']);
    });
}
