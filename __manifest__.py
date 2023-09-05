# -*- coding: utf-8 -*-
{
    'name': "_aTestApp",
    'application' :True,

    'summary': """
        Short (1 phrase/line) summary of the module's purpose, used as
        subtitle on modules listing or apps.openerp.com""",

    'description': """
        Long description of module's purpose
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'GEODAKi',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends':['base' ,'web'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],  
    'assets': {
        'web.assets_backend': [
            # 'owl/static/src/components/*/*.js',
            # 'owl/static/src/components/*/*.xml',
            # 'owl/static/src/components/*/*.scss',
            # 'owl/static/src/components/*/*.css',
            '_a_test_app/static/src/**/*',
        ],
    },
}
