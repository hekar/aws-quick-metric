'use strict';

const assert = require('assert');

class CustomMetric {
  /**
   * @param {object} AWS - require('aws-sdk')
   * @param {string} namespace - Namespace for metrics
   * @memberof CustomMetric
   */
  constructor(AWS, namespace) {
    assert(AWS, 'AWS required');
    assert(namespace, 'namespace required');
    this._cloudWatch = new AWS.CloudWatch({
      apiVersion: '2010-08-01'
    });
  }

  /**
   * Equivalent of CloudWatch `putMetric`
   * @memberof CustomMetric
   *
   * @param {object} params {
   *   metric {string}
   *   unit {string}
   *   dimensions {Array}
   *   value {number}
   * }
   * @returns {Promise<?>} de-serialized result of CloudWatch `putMetric`
   */
  stat({
    metric,
    value,
    unit,
    dimensions
  }) {
    assert(typeof metric === 'string', 'params.metric required');
    assert(typeof value === 'number', 'params.value required');
    unit = unit || 'None';
    dimensions = dimensions || [];

    const params = {
      MetricData: [{
        MetricName: metric,
        Dimensions: dimensions,
        Unit: unit,
        Value: value
      }],
      Namespace: this.namespace
    };

    return this._cloudWatch.putMetrics(params).promise();
  }
}

module.exports = {
  CustomMetric
};
