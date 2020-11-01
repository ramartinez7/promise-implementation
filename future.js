
const axios = require('axios'); // npm i axios

// fn: (resolve, reject) => void

function Future(fn) {

    let next, error, state = 'pending', called = false, refThenCallback, refCatchCallback, actionTriggered = false;

    const resolve = (value) => {
        if (!called) {
            state = 'fulfilled';
            next = value;
            called = true;

            if (refThenCallback) {
                try {
                    refThenCallback(value);
                } catch (err) {
                    reject(err)
                }
            }
        }
    }

    const reject = (value) => {
        if (!called) {
            state = 'rejected';
            error = value;
            called = true;

            if (refCatchCallback) {
                try {
                    refCatchCallback(value);
                } catch (err) {
                    reject(err);
                }

            }
        }
    }

    const self = {
        then: (thenCallback) => {

            if (!actionTriggered) {
                actionTriggered = true;
                fn(resolve, reject); // if sinchronous then state is changed if not remains pending
            }
            if (state == 'pending') {
               
                refThenCallback = thenCallback;

            } else if (state == 'fulfilled') {

                try {
                    next = thenCallback(next);
                } catch (ex) {
                    error = ex;
                }

            }

            return self;

        },
        catch: (catchCallback) => {
            
            if (!actionTriggered) {
                actionTriggered = true;
                fn(resolve, reject); // if sinchronous then state is changed if not remains pending
            }

            if (state == 'pending') { // means is an asyncronous call, these calls happens outside exe

                refCatchCallback = catchCallback;

            } else if (state == 'rejected') {
                try {
                    error = catchCallback(error);
                } catch (ex) {
                    error = ex;
                }
            }

            return self; // allows chaining
        },
        state
    }

    return self;

}

const invocation = new Future((resolve, reject) => {

    axios.get('https://jsonplaceholder.typicode.com/todos/1')
        .then((res) => resolve({data: res.data}))
        .catch( err =>  reject('Ocurrió un error'))

})
.then((value) => console.log(value))
.catch((error) => console.log(error));




