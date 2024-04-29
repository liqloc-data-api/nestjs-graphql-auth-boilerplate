

export const KConversion = {
    conversionRate: 1000,
    to: function (value)  {return value / this.conversionRate},
    from: function (value) {return value * this.conversionRate}
} 