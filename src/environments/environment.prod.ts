export const environment: any = {
    production: true,

    session: { // Those data are updated by session service
        initial: '123456789',  // typical dev initial token
        timeout: 3600,         // timeout is updated client session context creation
        pingrate: 30           // Ping rate to check if server is still alive
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
