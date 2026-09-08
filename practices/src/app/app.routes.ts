import { Routes } from '@angular/router';
import { loadAdminPanelModule } from './components/day029-router-lazy-load/admin-chunk-loader';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'day003-data-binding'
  },
  {
    path: 'day002-hooks',
    title: 'Day002-Lifecycle-Hooks',
    loadComponent: () => import('./components/day002-hooks/day002-hooks').then(m => m.Day002Hooks)
  },
  {
    path: 'day003-data-binding',
    title: 'Day003-DataBinding',
    loadComponent: () => import('./components/day003-data-binding/day003-data-binding').then(m => m.Day003DataBinding)
  },
  {
    path: 'day004-structure-directive-if-else',
    title: 'Day004-Structure-Directive-If-Else',
    loadComponent: () => import('./components/day004-structure-directive-if-else/day004-structure-directive-if-else').then(m => m.Day004StructureDirectiveIfElse)
  },
  {
    path: 'day005-structure-directive-ng-for',
    title: 'Day005-Structure-Directive-NgFor',
    loadComponent: () => import('./components/day005-structure-directive-ng-for/day005-structure-directive-ng-for').then(m => m.Day005StructureDirectiveNgFor)
  },
  {
    path: 'day006-attribute-directive-class-style',
    title: 'Day006-Attribute-Directive-Class-Style',
    loadComponent: () => import('./components/day006-attribute-directive-class-style/day006-attribute-directive-class-style').then(m => m.Day006AttributeDirectiveClassStyle)
  },
  {
    path: 'day007-component-interaction-01',
    title: 'Day007-Component-Interaction-01',
    loadComponent: () => import('./components/day007-component-interaction-01/day007-component-interaction-01').then(m => m.Day007ComponentInteraction01)
  },
  {
    path: 'day008-component-interaction-02',
    title: 'Day008-Component-Interaction-02',
    loadComponent: () => import('./components/day008-component-interaction-02/day008-component-interaction-02').then(m => m.Day008ComponentInteraction02)
  },
  {
    path: 'day009-two-way-binding',
    title: 'Day009-two-way-binding',
    loadComponent: () => import('./components/day009-two-way-binding/day009-two-way-binding').then(m => m.Day009TwoWayBinding)
  },
  {
    path: 'day010-template-variable-viewchild-viewchildren',
    title: 'Day010-template-variable-viewchild-viewchildren',
    loadComponent: () => import('./components/day010-template-variable-viewchild-viewchildren/day010-template-variable-viewchild-viewchildren').then(m => m.Day010TemplateVariableViewchildViewchildren)
  },
  {
    path: 'day011-typescript-data-type',
    title: 'Day011-typescript-data-type',
    loadComponent: () => import('./components/day011-typescript-data-type/day011-typescript-data-type').then(m => m.Day011TypescriptDataType)
  },
  {
    path: 'day012-typescript-advanced-type',
    title: 'Day012-typescript-advanced-type',
    loadComponent: () => import('./components/day012-typescript-advanced-type/day012-typescript-advanced-type').then(m => m.Day012TypescriptAdvancedType)
  },
  {
    path: 'day013-content-projection-in-angular',
    title: 'Day013-content-projection-in-angular',
    loadComponent: () => import('./components/day013-content-projection-in-angular/day013-content-projection-in-angular').then(m => m.Day013ContentProjectionInAngular)
  },
  {
    path: 'day014-ng-template-ng-template-outlet-ng-container',
    title: 'Day014-ng-template-ng-template-outlet-ng-container',
    loadComponent: () => import('./components/day014-ng-template-ng-template-outlet-ng-container/day014-ng-template-ng-template-outlet-ng-container').then(m => m.Day014NgTemplateNgTemplateOutletNgContainer)
  },
  {
    path: 'day015-introduction-dependency-injection-in-angular',
    title: 'Day015-introduction-dependency-injection-in-angular',
    loadComponent: () => import('./components/day015-introduction-dependency-injection-in-angular/day015-introduction-dependency-injection-in-angular').then(m => m.Day015IntroductionDependencyInjectionInAngular)
  },
  {
    path: 'day016-dependency-injection-in-angular-part-2',
    title: 'Day016-dependency-injection-in-angular-part-2',
    loadComponent: () => import('./components/day016-dependency-injection-in-angular-part-2/day016-dependency-injection-in-angular-part-2').then(m => m.Day016DependencyInjectionInAngularPart2)
  },
  {
    path: 'day017-contentchild-contentchildren',
    title: 'Day017-contentchild-contentchildren',
    loadComponent: () => import('./components/day017-contentchild-contentchildren/day017-contentchild-contentchildren').then(m => m.Day017ContentchildContentchildren)
  },
  {
    path: 'day018-pipes',
    title: 'Day018-pipes',
    loadComponent: () => import('./components/day018-pipes/day018-pipes').then(m => m.Day018Pipes)
  },
  {
    path: 'day019-intro-rxjs-observable',
    title: 'Day019-intro-rxjs-observable',
    loadComponent: () => import('./components/day019-intro-rxjs-observable/day019-intro-rxjs-observable').then(m => m.Day019IntroRxjsObservable)
  },
  {
    path: 'day020-rxjs-creation',
    title: 'Day020-rxjs-creation',
    loadComponent: () => import('./components/day020-rxjs-creation/day020-rxjs-creation').then(m => m.Day020RxjsCreation)
  },
  {
    path: 'day021-rxjs-transformation',
    title: 'Day021-rxjs-transformation',
    loadComponent: () => import('./components/day021-rxjs-transformation/day021-rxjs-transformation').then(m => m.Day021RxjsTransformation)
  },
  {
    path: 'day022-rxjs-filtering',
    title: 'Day022-rxjs-filtering',
    loadComponent: () => import('./components/day022-rxjs-filtering/day022-rxjs-filtering').then(m => m.Day022RxjsFiltering)
  },
  {
    path: 'day023-rxjs-combination',
    title: 'Day023-rxjs-combination',
    loadComponent: () => import('./components/day023-rxjs-combination/day023-rxjs-combination').then(m => m.Day023RxjsCombination)
  },
  {
    path: 'day024-rxjs-error-handling-conditional',
    title: 'Day024-rxjs-error-handling-conditional',
    loadComponent: () => import('./components/day024-rxjs-error-handling-conditional/day024-rxjs-error-handling-conditional').then(m => m.Day024RxjsErrorHandlingConditional)
  },
  {
    path: 'day025-rxjs-hoo-utility',
    title: 'Day025-rxjs-hoo-utility',
    loadComponent: () => import('./components/day025-rxjs-hoo-utility/day025-rxjs-hoo-utility').then(m => m.Day025RxjsHooUtility)
  },
  {
    path: 'day026-rxjs-subject-multicast',
    title: 'Day026-rxjs-subject-multicast',
    loadComponent: () => import('./components/day026-rxjs-subject-multicast/day026-rxjs-subject-multicast').then(m => m.Day026RxjsSubjectMulticast)
  },
  {
    path: 'day027-router',
    title: 'Day027-router',
    loadComponent: () => import('./components/day027-router/day027-router').then(m => m.Day027Router),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/day027-router/article-list/article-list').then(m => m.ArticleList)
      },
      {
        path: ':slug',
        loadComponent: () => import('./components/day027-router/article-detail/article-detail').then(m => m.ArticleDetail)
      }
    ]
  },
  {
    path: 'day028-router-feature-child-services',
    title: 'Day028-router-feature-child-services',
    loadComponent: () => import('./components/day028-router-feature-child-services/day028-router-feature-child-services').then(m => m.Day028RouterFeatureChildServices),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'article'
      },
      {
        path: 'article',
        loadComponent: () => import('./components/day028-router-feature-child-services/article-layout/article-layout').then(m => m.ArticleLayout),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'feature-module-va-child-routes'
          },
          {
            path: ':slug',
            loadComponent: () => import('./components/day028-router-feature-child-services/article-detail/article-detail').then(m => m.ArticleDetail)
          }
        ]
      }
    ]
  },
  {
    path: 'day029-router-lazy-load',
    title: 'Day029-router-lazy-load',
    loadComponent: () => import('./components/day029-router-lazy-load/day029-router-lazy-load').then(m => m.Day029RouterLazyLoad),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/day029-router-lazy-load/lazy-load-home/lazy-load-home').then(m => m.LazyLoadHome)
      },
      {
        path: 'admin',
        loadComponent: () => loadAdminPanelModule().then(m => m.AdminPanel)
      }
    ]
  },
  {
    path: 'day030-router-guards-resolvers',
    title: 'Day030-router-guards-resolvers',
    loadComponent: () => import('./components/day030-router-guards-resolvers/day030-router-guards-resolvers').then(m => m.Day030RouterGuardsResolvers)
  },
  {
    path: 'day031-router-guards-resolvers-2',
    title: 'Day031-router-guards-resolvers-2',
    loadComponent: () => import('./components/day031-router-guards-resolvers-2/day031-router-guards-resolvers-2').then(m => m.Day031RouterGuardsResolvers2)
  },
  {
    path: 'day032-router-guards-resolvers-3',
    title: 'Day032-router-guards-resolvers-3',
    loadComponent: () => import('./components/day032-router-guards-resolvers-3/day032-router-guards-resolvers-3').then(m => m.Day032RouterGuardsResolvers3)
  },
  {
    path: 'day033-template-driven-forms',
    title: 'Day033-template-driven-forms',
    loadComponent: () => import('./components/day033-template-driven-forms/day033-template-driven-forms').then(m => m.Day033TemplateDrivenForms)
  },
  {
    path: 'day034-template-driven-forms-2',
    title: 'Day034-template-driven-forms-2',
    loadComponent: () => import('./components/day034-template-driven-forms-2/day034-template-driven-forms-2').then(m => m.Day034TemplateDrivenForms2)
  },
  {
    path: 'day035-reactive-forms',
    title: 'Day035-reactive-forms',
    loadComponent: () => import('./components/day035-reactive-forms/day035-reactive-forms').then(m => m.Day035ReactiveForms)
  },
  {
    path: 'day036-reactive-forms-2',
    title: 'Day036-reactive-forms-2',
    loadComponent: () => import('./components/day036-reactive-forms-2/day036-reactive-forms-2').then(m => m.Day036ReactiveForms2)
  },
  {
    path: 'day037-form-async-validator',
    title: 'Day037-form-async-validator',
    loadComponent: () => import('./components/day037-form-async-validator/day037-form-async-validator').then(m => m.Day037FormAsyncValidator)
  },
  {
    path: 'day038-dynamic-component',
    title: 'Day038-dynamic-component',
    loadComponent: () => import('./components/day038-dynamic-component/day038-dynamic-component').then(m => m.Day038DynamicComponent)
  },
  {
    path: 'day039-micro-frontends',
    title: 'Day039-micro-frontends',
    loadComponent: () => import('./components/day039-micro-frontends/day039-micro-frontends').then(m => m.Day039MicroFrontends)
  },
  {
    path: 'day040-jira-angular-01',
    title: 'Day040-jira-angular-01',
    loadComponent: () => import('./components/day040-jira-angular-01/day040-jira-angular-01').then(m => m.Day040JiraAngular01)
  },
  {
    path: 'day041-jira-angular-02',
    title: 'Day041-jira-angular-02',
    loadComponent: () => import('./components/day041-jira-angular-02/day041-jira-angular-02').then(m => m.Day041JiraAngular02)
  },
  {
    path: 'day042-angular-cdk-coercion',
    title: 'Day042-angular-cdk-coercion',
    loadComponent: () => import('./components/day042-angular-cdk-coercion/day042-angular-cdk-coercion').then(m => m.Day042AngularCdkCoercion)
  },
  {
    path: 'day043-angular-disable-control-directive',
    title: 'Day043-angular-disable-control-directive',
    loadComponent: () => import('./components/day043-angular-disable-control-directive/day043-angular-disable-control-directive').then(m => m.Day043AngularDisableControlDirective)
  },
  {
    path: 'day044-output-observable',
    title: 'Day044-output-observable',
    loadComponent: () => import('./components/day044-output-observable/day044-output-observable').then(m => m.Day044OutputObservable)
  },
  {
    path: 'day045-angular-observable-subscription-unsubscribe',
    title: 'Day045-angular-observable-subscription-unsubscribe',
    loadComponent: () => import('./components/day045-angular-observable-subscription-unsubscribe/day045-angular-observable-subscription-unsubscribe').then(m => m.Day045AngularObservableSubscriptionUnsubscribe)
  },
  {
    path: 'day046-javascript-widget-embedded-script',
    title: 'Day046-javascript-widget-embedded-script',
    loadComponent: () => import('./components/day046-javascript-widget-embedded-script/day046-javascript-widget-embedded-script').then(m => m.Day046JavascriptWidgetEmbeddedScript)
  },
  {
    path: 'day047-composition-form-datasource-with-directive',
    title: 'Day047-composition-form-datasource-with-directive',
    loadComponent: () => import('./components/day047-composition-form-datasource-with-directive/day047-composition-form-datasource-with-directive').then(m => m.Day047CompositionFormDatasourceWithDirective)
  },
  {
    path: 'day048-using-dependency-injection-to-get-data-from-activated-route',
    title: 'Day048-using-dependency-injection-to-get-data-from-activated-route',
    loadComponent: () => import('./components/day048-using-dependency-injection-to-get-data-from-activated-route/day048-using-dependency-injection-to-get-data-from-activated-route').then(m => m.Day048UsingDependencyInjectionToGetDataFromActivatedRoute)
  },
  {
    path: 'day049-advanced-javascript',
    title: 'Day049-advanced-javascript',
    loadComponent: () => import('./components/day049-advanced-javascript/day049-advanced-javascript').then(m => m.Day049AdvancedJavascript)
  }
];
