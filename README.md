# AWS Quick Metric

Easier to use AWS.CloudWatch putMetric for custom metrics.

```js
const AWS = require('aws-sdk');
const { CustomMetric } = require('aws-quick-metric');

const metric = new CustomMetric(AWS, 'mynamespace');

metric.stat({
  metric: 'mymetric',
  value: 1.0,
  unit: 'None'
}).then(...);
```
