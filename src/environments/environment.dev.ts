export const environment: any = {
    production: false,

    session: { // Those data are updated by session service
        initial: '123456789',   // typical dev initial token
        timeout: 60 * 60,       // session context timeout (token will be refreshed before that timeout)
        pingrate: 30,           // Ping rate to check if server is still alive -- FIXME: not used for now
    },

    service: {

        ip: null,           // dynamically set when set to null (see main.ts)
        port: null,         //  dynamically set when set to null (see main.ts)
        api_url: "/api",

        /*
        aglIdentity: 'ws://localhost:5000',
        afmMain: 'ws://localhost:5000'
        */
    }
};