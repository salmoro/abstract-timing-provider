# Abstract Timing Provider
A library for easily setting up a Timing Object Provider using any data source. 

### Demo
https://salmoro.github.io/abstract-timing-provider/demo/dist


# Installation
> **Note** 
> "firebase" installation is only needed if using Firebase as a datasource

```shell
npm install firebase abstract-timing-provider
```
# Usage

```ts
import {AbstractTimingProvider} from 'abstract-timing-provider';
import {FirebaseDatasource} from "abstract-timing-provider/datasources";

const dataSource = new FirebaseDatasource({
    docPath: `my-sync/${sessionId}`, // A unique path which correlates to a specific session 
    firebase: {
        projectId: '<FIREBASE_PROJECT_ID>',
        apiKey: '<FIREBASE_API_KEY>',
    }
});

const provider = new AbstractTimingProvider(dataSource);

// Do something with the provider, for example:
new TimingObject(provider);
```