import {
  AgendaModuleAsyncOptions,
  AgendaModuleOptions,
  AgendaOptionsFactory,
} from './agenda-module-options.interface';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Agenda } from 'agenda';
import { AgendaService } from './agenda.service';

export const AGENDA_MODULE_OPTIONS = 'AGENDA_MODULE_OPTIONS';

function createAgendaProvider(options: AgendaModuleOptions): any[] {
  return [{ provide: AGENDA_MODULE_OPTIONS, useValue: options || {} }];
}

@Module({
  providers: [
    {
      provide: AgendaService,
      useFactory: async (options) => {
        const agenda = new Agenda(options);
        agenda.defaultLockLifetime(10000);
        await agenda.start();
        return agenda;
      },
      inject: [AGENDA_MODULE_OPTIONS],
    },
  ],
  exports: [AgendaService],
})
export class AgendaModule {
  static forRoot(options: AgendaModuleOptions): DynamicModule {
    return {
      module: AgendaModule,
      providers: createAgendaProvider(options),
    };
  }

  static forRootAsync(options: AgendaModuleAsyncOptions): DynamicModule {
    return {
      module: AgendaModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(
    options: AgendaModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: AgendaModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: AGENDA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: AGENDA_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AgendaOptionsFactory) =>
        await optionsFactory.createAgendaOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
