const globalErrhandler = (err,req,res,next)=>{
    // status failed/ something/server error
    //message
    // stack
    const stack = err.stack;
    const message = err.message;
    const status = err.status ? err.status:"Failed";
    const statusCode = err.statusCode ? err.statusCode: 500;
    // send respond

    res.status(statusCode).json({
        message,
        status,
        stack,
    });
};
export default globalErrhandler;