# -*- coding: utf-8 -*-
from odoo import http


class ATestApp(http.Controller):
#     @http.route('/_a_test_app/_a_test_app', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

    @http.route('/_a_test_app/_a_test_app/objects', auth='public')
    def list(self, **kw):
        return http.request.render('_a_test_app.listing', {
            'root': '/_a_test_app/_a_test_app',
            'objects': http.request.env['_a_test_app._a_test_app'].search([]),
        })

#     @http.route('/_a_test_app/_a_test_app/objects/<model("_a_test_app._a_test_app"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('_a_test_app.object', {
#             'object': obj
#         })
