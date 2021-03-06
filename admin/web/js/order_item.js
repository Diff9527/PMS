/**
 * 基础档案->订单明细
 */
Ext.define('js.order_item', {
    store: Ext.create('Ext.data.Store', {
        storeId: 'order_itemStore', model: 'Ext.data.Model', pageSize: 0,
        proxy: {
            extraParams: {action: 'query'},
            type: 'ajax', url: 'app/order_itemReceive',
            actionMethods: {read: 'POST'},
            reader: {
                type: 'json',
                root: 'jsonData'
            }
        }
    }),

    orderStore: Ext.create('Ext.data.Store', {
        storeId: 'order_itemOrderStore', model: 'Ext.data.Model', pageSize: 0,
        proxy: {
            extraParams: {action: 'query'},
            type: 'ajax', url: 'app/orderReceive',
            actionMethods: {read: 'POST'},
            reader: {
                type: 'json',
                root: 'jsonData'
            }
        }
    }),

    productStore: Ext.create('Ext.data.Store', {
        storeId: 'order_itemProductStore', model: 'Ext.data.Model', pageSize: 0,
        proxy: {
            extraParams: {action: 'queryForCombo'},
            type: 'ajax', url: 'app/productReceive',
            actionMethods: {read: 'POST'},
            reader: {
                type: 'json',
                root: 'jsonData'
            }
        }
    }),

    editPanel: {
        id: 'order_itemFormPanel',
        title: '订单表单信息',
        xtype: 'form',
        region: 'north',
        layout: 'form',
        method: 'post',
        url: 'app/order_itemReceive',
        fieldDefaults: {
            labelWidth: 100
        },
        items: [{
            xtype: 'fieldset',
            title: '订单明细属性',
            autoHeight: true,
            autoScroll: true,
            collapsible: true,
            items: [{
                xtype: "hiddenfield",
                name: "action",
                value: 'add'
            }, {
                xtype: "hiddenfield",
                name: "orderItemId",
                value: ''
            }, {
                xtype: "combo",
                store: 'order_itemOrderStore',
                name: "orderCode",
                fieldLabel: "订单",
                displayField: 'orderCode',
                valueField: 'orderCode',
                maxLength: 20,
                allowBlank: false,
                editable: false
            }, {
                xtype: "combo",
                store: 'order_itemProductStore',
                name: "productCode",
                fieldLabel: "产品",
                displayField: 'productCombo',
                valueField: 'productCode',
                maxLength: 50,
                allowBlank: false,
                editable: false
            }, {
                xtype: "numberfield",
                name: "productDemandNumber",
                fieldLabel: "订购该产品数量",
                minValue: 0,
                allowBlank: false
            }, {
                xtype: "textareafield",
                name: "orderItemNote",
                fieldLabel: "订单项说明",
                maxLength: 50,
                grow: true
            }]
        }],

        buttonAlign: 'center',
        buttons: [{
            text: '重置',
            handler: function () {
                this.up('form').getForm().reset();
            }
        }, {
            text: '保存',
            formBind: true, //only enabled once the form is valid 只有当窗体有效时才启用
            disabled: true,
            handler: function () {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        waitTitle: '正在保存',
                        waitMsg: '请稍等……',
                        params: {},
                        success: function (form, action) {
                            form.reset();
                            Ext.getStore('order_itemStore').reload();
                        },
                        failure: function (form, action) {
                            Ext.Msg.alert('操作失败', action.result.msg);
                        }
                    });
                }
            }
        }]
    },

    queryPanel: {
        title: '查询条件',
        region: 'north',
        layout: 'column',
        xtype: 'form',
        bodyStyle: 'padding:5px 0px 5px 0px',
        method: 'post',
        url: 'app/order_itemReceive',
        fieldDefaults: {
            labelWidth: 60
        },
        items: [{
            xtype: "combo",
            store: 'order_itemOrderStore',
            name: "orderCode",
            fieldLabel: "订单",
            displayField: 'orderCode',
            valueField: 'orderCode',
            margin: '0px 0px 0px 10px',
            maxLength: 20,
            forceSelection: true
        }, {
            xtype: "combo",
            store: 'order_itemProductStore',
            name: "productCode",
            fieldLabel: "产品",
            displayField: 'productCombo',
            valueField: 'productCode',
            margin: '0px 0px 0px 10px',
            maxLength: 50,
            forceSelection: true
        }, {
            xtype: 'button',
            text: '查询',
            margin: '0px 0px 0px 10px',
            handler: function () {
                var form = this.up('form').getForm(),
                    store = Ext.getStore('order_itemStore');
                var proxy = store.getProxy();
                if (form.isValid()) {
                    var params = form.getValues();
                    params.action = 'conditionQuery';
                    proxy.extraParams = params;
                    store.load();
                }
            }
        }]
    },

    gridPanel: {
        title: '订单详情信息列表',
        region: 'center',
        xtype: "grid",
        autoScroll: true,
        store: 'order_itemStore',
        columns: [{
            xtype: "hiddenfield",
            text: 'orderItemId',
            dataIndex: 'orderItemId',
            flex: 1,
            align: 'center'
        }, {
            text: '订单编码',
            dataIndex: 'orderCode',
            flex: 1,
            align: 'center'
        }, {
            text: '产品编码',
            dataIndex: 'productCode',
            flex: 1,
            align: 'center'
        }, {
            text: '产品名称',
            dataIndex: 'productName',
            flex: 1,
            align: 'center'
        }, {
            text: '订购该产品数量',
            dataIndex: 'productDemandNumber',
            flex: 1,
            align: 'center'
        }, {
            text: '订单项说明',
            dataIndex: 'orderItemNote',
            flex: 1,
            align: 'center'
        }, {
            text: '操作',
            xtype: 'actioncolumn',
            items: [{
                iconCls: 'application_form_edit',
                tooltip: '编辑',
                handler: function (grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    var form = Ext.getCmp('order_itemFormPanel').getForm();
                    Ext.Ajax.request({
                        url: 'app/order_itemReceive',
                        method: 'post',
                        editForm: form,
                        params: {
                            action: 'queryByPK',
                            orderItemId: rec.get('orderItemId')
                        },
                        success: function (response, options) {
                            var json = Ext.decode(response.responseText);
                            options.editForm.findField('action').setValue('edit');
                            options.editForm.setValues(json.formValue);
                        },
                        failure: function (response, options) {
                            Ext.Msg.alert('错误', '操作失败！');
                        }
                    });
                }
            }, {
                iconCls: 'delete',
                tooltip: '删除',
                handler: function (grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    Ext.Msg.confirm('警告', '该操作将从数据库中删除记录！', function (btn) {
                        if (btn == 'yes') {
                            Ext.Ajax.request({
                                url: 'app/order_itemReceive',
                                method: 'post',
                                params: {
                                    action: 'del',
                                    orderItemId: rec.get('orderItemId')
                                },
                                success: function (response, options) {
                                    Ext.getStore('order_itemStore').reload();
                                },
                                failure: function (response, options) {
                                    Ext.Msg.alert('错误', '操作失败！');
                                }
                            });
                        }
                    });
                }
            }]
        }]
    },

    viewPanel: {
        region: 'center',
        layout: 'border'
    },

    body: Ext.define('PMS.order_item.body', {
        extend: 'Ext.panel.Panel',
        layout: 'border'
    }),

    constructor: function () {
        var me = this;
        var body = Ext.create(me.body.$className, {
            items: [me.editPanel,
                js.lib.Common.MixObject(me.viewPanel, {items: [me.queryPanel, me.gridPanel]})
            ]
        });
        me.store.load();
        me.orderStore.load();
        me.productStore.load();
        return body;
    }
});
