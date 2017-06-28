'use strict';

const assert = require('assert');

class CustomMetric {
  /**
   * @param {object} AWS - require('aws-sdk')
   * @param {string} namespace - Namespace for metrics
   * @param {object} options
   * {
   *   disabled {string}
   * }
   * @memberof CustomMetric
   */
  constructor(AWS, namespace, options) {
    assert(AWS, 'AWS required');
    assert(typeof namespace === 'string', 'namespace required and must be string');
    const { disabled } = options || {};
    this._cloudWatch = new AWS.CloudWatch({
      apiVersion: '2010-08-01'
    });
    this._disabled = disabled;
    this._namespace = namespace;
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
    if (this._disabled) {
      return Promise.resolve({});
    }

    assert(typeof metric === 'string', 'params.metric required and must be string');
    assert(typeof value === 'number', 'params.value required and must be number');
    unit = unit || 'None';
    dimensions = dimensions || [];

    const params = {
      MetricData: [{
        MetricName: metric,
        Dimensions: dimensions,
        Unit: unit,
        Value: value
      }],
      Namespace: this._namespace
    };

    return this._cloudWatch.putMetricData(params).promise();
  }
}

module.exports = {
  CustomMetric
};
