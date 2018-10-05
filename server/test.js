function test(_abc, _start, _end) {
    if (_start === _end) {
        console.log("Done");
    } else {
        console.log(_abc[_start]);
        _start++
        test(_abc, _start, _end);
    }
}


let abc = [1, 5, 6, 4, 3, 2, 99];

test(abc, 0, abc.length)