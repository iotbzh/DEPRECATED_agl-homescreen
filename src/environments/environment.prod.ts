export const environment: any = {
    production: true,

    session: { // Those data are updated by session service
        initial: '123456789',   // typical dev initial token
        timeout: 60 * 60,       // timeout is updated client session context creation
        pingrate: 30            // Ping rate to check if server is still alive
    },

    paths: { // Warning paths should end with /
        image: 'images/',
        avatar: 'images/avatars/'
    },

	service: {
        ip: null,           // dynamically set when set to null (see main.ts)
        port: null,         //  dynamically set when set to null (see main.ts)
        api_url: "/api",
    }
};
