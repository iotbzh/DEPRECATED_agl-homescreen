/**************************************************************************
 *                      DO NOT MODIFY ANYTHING HERE                       *
 *  THIS FILE WILL BE REPLACED BY THE CORRESPONDING ENV FILE AT RUN TIME  *
 *         do env modifications @ ./environment.(dev/prod).ts             *
 *                                                                        *
 *     YOU NEED TO KEEP THE SAME STRUCTURE ACROSS ALL THE ENV FILES       *
 *   import this file in any of your components to access env variables   *
 **************************************************************************/

export const environment: any = {
    production: true,

    debug: true,                // enable console.debug statements

    session: { // Those data are updated by session service
        initial: '123456789',   // typical dev initial token
        timeout: 60 * 60,       // timeout is updated client session context creation
        pingrate: 30,           // Ping rate to check if server is still alive
        maxConnectionRetry: 10
    },

    paths: { // Warning paths should end with /
        image: 'images/',
        avatar: 'images/avatars/'
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