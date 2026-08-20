import { RegistrarAdapter } from './RegistrarAdapter';
import { MockRegistrarAdapter } from './MockRegistrarAdapter';
import { KFintechAdapter } from './KFintechAdapter';
import { MUFGIntimeAdapter } from './MUFGIntimeAdapter';
import { BigshareAdapter } from './BigshareAdapter';
import { CameoAdapter } from './CameoAdapter';

export class RegistrarFactory {
  private static adapters: Map<string, RegistrarAdapter> = new Map<string, RegistrarAdapter>([
    ['MOCK', new MockRegistrarAdapter()],
    ['KFINTECH', new KFintechAdapter()],
    ['LINK_INTIME', new MUFGIntimeAdapter()],
    ['BIGSHARE', new BigshareAdapter()],
    ['CAMEO', new CameoAdapter()],
  ]);

  /**
   * Resolves the appropriate RegistrarAdapter for a registrar code.
   * If DATA_PROVIDER === 'mock', returns MockRegistrarAdapter for safe testing.
   * In production, strictly returns the matching active adapter, or throws if unavailable.
   */
  static getAdapter(registrarCode: string): RegistrarAdapter {
    const isMockMode = process.env.DATA_PROVIDER === 'mock';

    if (isMockMode) {
      // In mock mode, if requested code exists, use it in mock simulation mode or fallback to MockRegistrar
      const adapter = this.adapters.get(registrarCode?.toUpperCase());
      return adapter || new MockRegistrarAdapter();
    }

    // Strict production mode
    const code = registrarCode?.toUpperCase();
    const adapter = this.adapters.get(code);

    if (!adapter) {
      throw new Error(`Registrar adapter for code '${registrarCode}' is not supported or active.`);
    }

    return adapter;
  }
}
