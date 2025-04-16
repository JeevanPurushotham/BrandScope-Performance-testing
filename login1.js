
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
    const loginUrl = `${QA-baseUrl}sign_in`;
    const showroomUrl = `${QA-baseUrl}showroom`;

    const payload = JSON.stringify({
        username: __ENV.USERNAME,
        password: __ENV.PASSWORD,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: '10s', // Set timeout for requests
    };

    let response;
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
        response = http.post(loginUrl, payload, params);

        if (response.status === 200) {
            success = true;
        } else {
            retries--;
            console.log(`Login attempt failed, retries left: ${retries}`);
            sleep(1); 
        }
    }

    // Validate login success
    check(response, {
        'Login request status is 200': (r) => r.status === 200,
        'Login success': (r) => r.body.includes('success'), // Adjust if needed
    });

    // If login is successful, call the showroom API
    if (success) {
        const showroomResponse = http.get(showroomUrl, params);
        console.log('Showroom Response:', showroomResponse.body);

        // Validate showroom API response
        check(showroomResponse, {
            'Showroom request status is 200': (r) => r.status === 200,
            'Showroom contains "showroom"': (r) => r.body.includes('showroom'), // Adjust if needed
        });

        console.log(`Showroom Response: ${showroomResponse.body}`);
    }
}
