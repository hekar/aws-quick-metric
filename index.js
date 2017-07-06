'use strict';

const assert = require('assert');

class CustomMetric {
  /**
   * @param {object} AWS - require('aws-sdk')
   * @param {string} namespace - Namespace for metrics
   * @param {object} options
   * {
   *   enabled {string} - Enable/disable CustomMetrics. Defaults to true
   *   flushCounter {number} - Number of metrics written, before being sent to CloudWatch. Defaults to 0
   * }
   * @memberof CustomMetric
   */
  constructor(AWS, namespace, options) {
    assert(AWS, 'AWS required');
    assert(typeof namespace === 'string', 'namespace required and must be string');
    const { enabled, flushCounter } = options || {};
    this._cloudWatch = new AWS.CloudWatch({
      apiVersion: '2010-08-01'
    });
    this._namespace = namespace;
    this._enabled = (typeof enabled === 'undefined') ? true : enabled;
    this._flushCounter = flushCounter || 0;
    this._statQueue = [];
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
    dimensions,
    immediate
  }) {
    if (!this._enabled) {
      return Promise.resolve({});
    }

    const params = {
      metric,
      value,
      unit,
      dimensions
    };

    return (immediate) ?
      this._send([params]) :
      this._queue(params);
  }

  finish() {
    if (this._statQueue.length > 0 && this._statQueue.length >= this._flushCounter) {
      const copy = this._copyQueue();
      this._clearQueue();
      return this._send(copy);
    } else {
      return Promise.resolve();
    }
  }

  _queue(params) {
    this._statQueue.push(params);
    return Promise.resolve();
  }

  _copyQueue() {
    return this._statQueue.slice();
  }

  _clearQueue() {
    return this._statQueue.splice(0);
  }

  _send(items) {
    const metrics = items.map(item => {
      let {
        metric,
        value,
        unit,
        dimensions
      } = item;

      unit = unit || 'None';
      dimensions = dimensions || [];

      assert(typeof metric === 'string', `params.metric required and must be string (${metric})`);
      assert(typeof value === 'number', `params.value required and must be number (${value})`);

      return {
        MetricName: metric,
        Dimensions: dimensions,
        Unit: unit,
        Value: value
      };
    });

    const params = {
      MetricData: metrics,
      Namespace: this._namespace
    };

    return this._cloudWatch
      .putMetricData(params)
      .promise();
  }
}

module.exports = {
  CustomMetric
};
