const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: 'C:\\oraclexe\\app\\oracle\\product\\11.2.0\\server\\bin' });

async function test() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: 'system',
      password: 'admin123',
      connectString: '192.168.1.37:1523/xe'
    });
    console.log('✅ Connected!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) await conn.close();
  }
}

test();