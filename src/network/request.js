import axios from 'axios'
import router from '../router/index'

export function request1(config,success,failure){
    //success和failure是请求成功和请求失败时的两个函数
    //通过上述两个函数将请求成功和请求失败的结果传递出去
    //1.创建axios实例
    const instance = axios.create({
        baseURL:'http://127.0.0.1:8000',
        timeout:5000
    })
    
    instance(config)
    .then(res=>{
        success(res);
    })
    .catch(err =>{
        failure(err);
    })
}

export function request2(config){
    //success和failure是请求成功和请求失败时的两个函数
    //通过上述两个函数将请求成功和请求失败的结果传递出去
    //1.创建axios实例
    const instance = axios.create({
        baseURL:'http://127.0.0.1:8000',
        timeout:5000
    })
    
    instance(config.baseConfig)
    .then(res=>{
        config.success(res);
    })
    .catch(err =>{
        config.failure(err);
    })
}

export function request3(config){
    return new Promise((resolve,reject) => {
        //1.创建axios实例
        const instance = axios.create({
            baseURL:'http://127.0.0.1:8000',
            timeout:5000
        })

        instance(config)
        .then(res=>{
            resolve(res);
        })
        .catch(err =>{
            reject(err);
        })
    })
}

export function request4(config){
    //1.创建axios实例
    const instance = axios.create({
        baseURL:'http://127.0.0.1:8081',
        timeout:5000
    })

    instance.interceptors.request.use((config)=>{
        // 在发送请求之前做些什么
        let pathname = config.url;
        if(localStorage.getItem('token')){
            if(pathname != '/' &&  pathname != '/login'){
                config.headers={'Authorization':localStorage.getItem('token')}
                //config.headers.common['token'] = localStorage.getItem('token');
            }
        }
        return config;
    }, function (error) {
        // 对请求错误做些什么
        console.log(error)
        return Promise.reject(error);
    });

    // 添加响应拦截器
    instance.interceptors.response.use((response)=> {
        // 对响应数据做点什么
        return response;
    }, function (error) {
        // 对响应错误做点什么
        if (error.response) {
            switch (error.response.status) {
                // 返回401，清除token信息并跳转到登录页面
                case 401:
                    localStorage.removeItem('token');
                    router.replace({
                        path: '/login'
                    })
                    break;
                case 403:
                    localStorage.removeItem('token');
                    router.replace({
                        path: '/login'
                    })
                    break;
            }
            // 返回接口返回的错误信息
            return Promise.reject(error.response.data);
        }
    });
    return instance(config)
}